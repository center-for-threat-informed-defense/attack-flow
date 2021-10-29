from attack_flow.schema import (
    anchor,
    generate_html,
    SchemaProperty,
)


def test_schema_property_string():
    sp = SchemaProperty('test-prop', False, {
        'description': 'My description :>',
        'type': 'string',
    })
    assert sp.name == 'test-prop'
    assert sp.type == 'string'
    assert not sp.required
    assert sp.html_type == 'string'
    assert sp.html_description == 'My description :&gt;'


def test_schema_property_uuid():
    sp = SchemaProperty('test-uuid', True, {
        'description': 'My description :>',
        'type': 'string',
        'format': 'uuid',
    })
    assert sp.name == 'test-uuid'
    assert sp.type == 'string'
    assert sp.required
    assert sp.html_type == 'uuid'
    assert sp.html_description == 'My description :&gt;'


def test_schema_property_datetime():
    sp = SchemaProperty('test-datetime', True, {
        'description': 'My description',
        'type': 'string',
        'format': 'date-time',
    })
    assert sp.name == 'test-datetime'
    assert sp.type == 'string'
    assert sp.required
    assert sp.html_type == 'date-time'
    assert sp.html_description == \
        'My description (RFC-3339 format, e.g. YYYY-MM-DDThh:mm:ssZ)'


def test_schema_property_array_of_string():
    sp = SchemaProperty('test-array', True, {
        'description': 'My description',
        'type': 'array',
        'items': {'type': 'string'}
    })
    assert sp.name == 'test-array'
    assert sp.type == 'array'
    assert sp.subtype == 'string'
    assert sp.required
    assert sp.html_type == 'array of string'
    assert sp.html_description == 'My description'


def test_schema_property_enum():
    sp = SchemaProperty('test-enum', True, {
        'description': 'My description',
        'type': 'string',
        'enum': ['foo', 'bar']
    })
    assert sp.name == 'test-enum'
    assert sp.type == 'string'
    assert sp.required
    assert sp.html_type == 'enum'
    assert sp.html_description == 'My description (Enum values: "foo", "bar")'


def test_generate_html():
    actual_html = generate_html({
        '__root__': {
            'prop1': SchemaProperty('prop1', False, {
                'description': 'prop1 description',
                'type': 'string',
            }),
            'prop2': SchemaProperty('prop2', True, {
                'description': 'prop2 description',
                'type': 'string',
            })
        }
    })

    expected_html = [
        '<h3 id="TopLevelMetadata">Top Level Metadata Fields</h3>',
        '<table>',
        '  <tr>',
        '    <th>Name</th>',
        '    <th>Type</th>',
        '    <th>Required</th>',
        '    <th>Description</th>',
        '  </tr>',
        '  <tr>',
        '    <td>prop1</td>',
        '    <td>string</td>',
        '    <td>No</td>',
        '    <td>prop1 description</td>',
        '  </tr>',
        '  <tr>',
        '    <td>prop2</td>',
        '    <td>string</td>',
        '    <td>Yes</td>',
        '    <td>prop2 description</td>',
        '  </tr>',
        '</table>',
        '',
    ]

    assert actual_html == expected_html


def test_anchor():
    assert anchor('? ASDF; 123 ') == 'ASDF123'
