'''
Tools for working with the Attack Flow schema.
'''
import json
from collections import OrderedDict
from datetime import datetime
import html
from pathlib import Path
import re
import string
import sys

from jsonschema import validate, draft202012_format_checker


ROOT_NODE = '__root__'
NON_ALPHA = re.compile('[^a-zA-Z0-9]')
START_TAG = re.compile('<!--JSON_SCHEMA.*-->')
END_TAG = re.compile('<!--/JSON_SCHEMA-->')


def validate_docs(schema_doc, attack_flow_docs):
    '''
    Validate a list of Attack Flow files against the specified schema.

    Returns a list, where each contains an exception if the file is not valid
    or ``None`` if the file is valid.
    '''
    exceptions = list()

    if isinstance(attack_flow_docs, str):
        attack_flow_docs = [attack_flow_docs]

    with open(schema_doc) as schema_file:
        schema_json = json.load(schema_file)

    for attack_flow_doc in attack_flow_docs:
        with open(attack_flow_doc) as attack_flow_file:
            attack_flow_json = json.load(attack_flow_file)

        try:
            validate(instance=attack_flow_json, schema=schema_json,
                     format_checker=draft202012_format_checker)
            exceptions.append(None)
        except Exception as e:
            exceptions.append(e)

    return exceptions


class SchemaProperty:
    '''
    Helper class for properties of schema objects.
    '''
    def __init__(self, name, required, property_dict):
        self.name = name
        self.type = property_dict['type']
        if self.type == 'array':
            self.subtype = property_dict['items']['type']
        else:
            self.subtype = ''
        self.description = property_dict['description']
        self.format = property_dict.get('format', '')
        self.pattern = property_dict.get('pattern', '')
        self.enum = property_dict.get('enum', '')
        self.required = required

    @property
    def html_type(self):
        ''' Return type field formatted as HTML. '''
        if self.type == 'array':
            if self.subtype == 'object':
                subtype_html = f'<a href="#{anchor(self.name)}">' + \
                   f'{html.escape(self.name)}</a>'
            else:
                subtype_html = self.subtype
            return f'{html.escape(self.type)} of {subtype_html}'
        elif self.type == 'enum':
            return 'TODO ENUM'
        elif self.format:
            return html.escape(f'{self.type} (format: {self.format})')
        else:
            return html.escape(self.type)

    @property
    def html_description(self):
        ''' Return description formatted as HTML. '''
        description = html.escape(self.description)
        if self.format == 'date-time':
            description += ' (RFC-3339 format, e.g. YYYY-MM-DDThh:mm:ssZ)'
        return description


def generate_schema_docs(schema_doc, old_doc):
    '''
    Generate documentation for the schema and insert into the doc file.
    '''
    with open(schema_doc) as schema_file:
        schema_json = json.load(schema_file)
    object_properties = get_properties(schema_json, node=ROOT_NODE)
    html = generate_html(object_properties)
    doc = insert_html(old_doc, html)
    return doc


def get_properties(schema_json, node):
    '''
    Return information about the properties of a JSON schema object.

    The properties are returned in a dictionary, where the key `node` contains
    properties of the top-level object. Nested objects are returned under
    keys corresponding to their property names.
    '''
    assert schema_json['type'] == 'object'
    objects = OrderedDict()
    objects[node] = OrderedDict()

    for name, property_dict in schema_json['properties'].items():
        required = name in schema_json.get('required', [])
        prop = SchemaProperty(name, required, property_dict)

        if prop.type == 'array' and prop.subtype == 'object':
            nested_objects = get_properties(property_dict['items'], node=name)
            objects.update(nested_objects)
        elif prop.type == 'object':
            nested_objects = get_properties(property_dict, node=name)
            objects.update(nested_objects)

        objects[node][name] = prop

    return objects


def generate_html(object_properties):
    '''
    Generate HTML (as list of lines) for the dictionary of object properties.
    '''
    html = list()
    root = object_properties.pop(ROOT_NODE)
    html.extend(generate_html_for_object('Top Level Metadata', root))
    for object_, properties in object_properties.items():
        html.append('')
        html.extend(generate_html_for_object(object_, properties))
    html.append('')
    return html


def anchor(name):
    ''' Generate a sanitized name to use as an HTML anchor. '''
    return re.sub(NON_ALPHA, '', name)


def generate_html_for_object(name, properties):
    '''
    Generate HTML for a single object's properties.
    '''
    table = list()
    html_name = html.escape(string.capwords(name))
    table.append(f'<h3 id="{anchor(name)}">{html_name} Fields</h3>')
    table.append('<table>')
    table.append('  <tr>')
    table.append('    <th>Name</th>')
    table.append('    <th>Type</th>')
    table.append('    <th>Required</th>')
    table.append('    <th>Description</th>')
    table.append('  </tr>')

    for prop_name, prop in properties.items():
        required = 'Yes' if prop.required else 'No'
        table.append('  <tr>')
        table.append(f'    <td>{html.escape(prop_name)}</td>')
        table.append(f'    <td>{prop.html_type}</td>')
        table.append(f'    <td>{required}</td>')
        table.append(f'    <td>{prop.html_description}</td>')
        table.append('  </tr>')

    table.append('</table>')
    return table


def insert_html(old_doc, html):
    '''
    Scan through text in open file ``old_doc`` and return its contents with
    the <!--JSON_SCHEMA--> tags replaced with new text from ``html``.
    '''
    output = list()

    # Output up to (but not including) the start tag.
    for line in old_doc:
        if START_TAG.search(line):
            break
        output.append(line.rstrip('\n'))
    else:
        raise Exception('Did not find start tag')

    # Output new start tag, new HTML, and new end tag.
    now = datetime.now().isoformat()
    name = Path(sys.argv[0]).name
    output.append(f'<!--JSON_SCHEMA Generated by `{name}` at {now}Z-->')
    output.extend(html)
    output.append('<!--/JSON_SCHEMA-->')

    # Scan to end tag but don't output any lines--this is the old HTML.
    for line in old_doc:
        if END_TAG.search(line):
            break
    else:
        raise Exception('Did not find end tag')

    # Output the rest of the lines in the file.
    for line in old_doc:
        output.append(line.rstrip('\n'))

    return '\n'.join(output)
