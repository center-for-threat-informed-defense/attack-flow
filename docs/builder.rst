Builder
=======

Overview
--------

Attack Flow Builder is a free and open source tool for creating, viewing, and editing
Attack Flows.

Tuesday TODO: all new screenshots for this page

.. figure:: _static/builder1.png
   :alt: Screenshot of Attack Flow Builder.
   :align: center

   View and edit Attack Flows using an intuitive drag-and-drop interface.

This web-based tool provides a workspace where you can populate information about
adversary actions and additional context, then weave those items into a flow by drawing
arrows to indicate the sequences of adversary techniques observed during an incident or
campaign.

Getting Started
---------------

**The quickest and easiest way to get started** is with our online option. Click the
button below to open the builder in a new tab, or select one of the :doc:`example_flows`
for viewing it in Attack Flow Builder.

.. caution::

   The online Attack Flow Builder stores documents in memory and on disk on your local
   machine, so any flows that you create or edit are completely private. However, the
   online version is accessed over the internet, and so your connection may be visible
   to some third parties (e.g. GitHub, ISPs). For a completely private experience,
   consider using the download or Docker approaches described below.

.. raw:: html

    <p>
        <a class="btn btn-primary" target="_blank" href="../ui/">
         Open Attack Flow Builder <i class="fa fa-external-link"></i></a>
    </p>

When you first open the Builder, if you did not select one of the example flows then
you will initially see a blank workspace. Right-click anywhere in this space to see a
palette of options.

.. image:: _static/builder2.png
  :width: 400
  :alt: Right-click to see a menu of options for nodes to create.

For example, you can select "Create Action Node" to create a new action. This will
create an empty action node in the workspace; you can fill in the details for this
action using the sidebar on the right.

.. image:: _static/builder7.png
  :width: 400
  :alt: An example of an action this is missing a required attribute.

You may notice validation errors in the bottom right corner if your flow is missing any
required fields. Click on the validation error to highlight the object that needs
fixing.

.. image:: _static/builder3.png
  :width: 400
  :alt: An example of an action with filled-in attributes.

Right-click to repeat the process and add a condition and another action, then fill in
the missing details. You can drag and drop items to arrange them however you want, for
example:

.. image:: _static/builder4.png
  :alt: Two actions and an asset with filled-in attributes

Finally, connect items together by drawing an arrow from the edge of one object to
another.

.. image:: _static/builder5.png
  :alt: The finished flow with connections between items.

Continue to build out your flow by adding objects, filling in the attributes, and
drawing arrows between nodes. When you are done, you go to the File menu to save your
flow.

.. image:: _static/builder6.png
  :width: 300
  :alt: How to save flows.

Save Attack Flow…
   Saves the file in \*.afd format, which can be opened for further editing in the
   future.
Publish Attack Flow…
   Saves the file in \*.json format, which is the standard format for exchanging and
   processing Attack Flows.

.. warning::

   The Attack Flow Builder does not automatically save your work. If you accidentally
   close the tab or navigate forward or backward, you will lose any unsaved work.
   Remember to save your work frequently. (This issue will be addressed in a future
   release.)

Docker
------

If you do not want to use the Attack Flow Builder embedded in this site, you can run it
locally `using Docker <https://www.docker.com/>`__ as shown below.

.. code:: shell

   $ docker pull ghcr.io/center-for-threat-informed-defense/attack-flow:main
   $ docker run --name AttackFlowBuilder \
      ghcr.io/center-for-threat-informed-defense/attack-flow:main

Once the container is running, you can open a brower tab to http://localhost:8080/ to
view the Builder.

If you want to customize and build your own Docker images, edit the `Dockerfile` and
then run this command to create the Docker image:

.. code:: shell

   $ make docker-build
   docker build . -t attack-flow-builder:latest
   [+] Building 2.9s (13/13) FINISHED
   => [internal] load build definition from Dockerfile                                                                                0.0s
   => => transferring dockerfile: 269B                                                                                                0.0s
   => [internal] load .dockerignore
   ...

If building the image completes successfully, then use this command to run the image:

.. code:: shell

   $ make docker-run
   docker run --rm -p 8080:80 attack-flow-builder:latest
   /docker-entrypoint.sh: /docker-entrypoint.d/ is not empty, will attempt to perform configuration
   /docker-entrypoint.sh: Looking for shell scripts in /docker-entrypoint.d/
   /docker-entrypoint.sh: Launching /docker-entrypoint.d/10-listen-on-ipv6-by-default.sh
   ...

Download
--------

If you do not wish to use Docker, you can also download the Builder from the GitHub
repository:

1. Go to the `Attack Flow release page
   <https://github.com/center-for-threat-informed-defense/attack-flow/releases>`__
   and download ``attack_flow_builder.zip``.
2. Unzip it.
3. In the ``attack_flow_builder/`` directory, double click on ``index.html`` to open
   it in a web browser.

Developer
---------

Finally, if you wish to help contribute code for Attack Flow Builder, you can set up
Builder in :ref:`a development environment <builder_dev>`.
