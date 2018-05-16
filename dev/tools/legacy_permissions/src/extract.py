import xml.etree.cElementTree as ET
import os
import csv

FILE_ROOT = os.path.dirname(__file__)

def main():
    xml_file_path = os.path.join(FILE_ROOT, 'permissions_uiconf.xml')
    with open(xml_file_path) as f:
        content = f.read()
    tree = ET.fromstring(content)

    # parent_map = {c:p for p in tree.iter() for c in p}
    # t_count = 0
    # for ui in tree.iter('ui'):
    #     parent = parent_map[ui]
    #     t_count += 1
    #     if parent.tag != 'permission' and parent.tag != 'permissionGroup':
    #         print(parent.tag)


    ui_list = []
    permissions_list = []

    for group in tree.iter('permissionGroup'):
        counter = 0
        for ui in group.findall('ui'):
            counter += 1
            ui_list.append((group, None, counter, ui))

        has_permission = False
        for permission in group.iter('permission'):
            has_permission = True
            permissions_list.append((group.attrib['id'], permission.attrib['id'], group.attrib['text'], permission.attrib['text']))
            counter = 0
            for ui in permission.findall('ui'):
                counter += 1
                ui_list.append((group, permission, counter, ui))

        if not has_permission:
            permissions_list.append((group.attrib['id'], None, group.attrib['text'] if 'text' in group.attrib else None, None))


    with open('../data/usecases.csv', 'w', newline='') as csvfile:
        writer = csv.writer(csvfile, dialect='excel', delimiter=',', quoting=csv.QUOTE_MINIMAL)
        writer.writerow(['group','permission', 'usecase','usecase #','usecase path','usecase missing attributes'])
        for item in ui_list:
            group = item[0]
            permission = item[1]
            counter = item[2]
            ui = item[3]
            attributes = ''
            for attribute_key in ui.attrib:
                if attribute_key != 'id':
                    attributes += f'{attribute_key} = {ui.attrib[attribute_key]}\n'
            attributes = attributes.rstrip()
            description = group.attrib.get("text")
            if permission:
                description += f'\n    {permission.get("text")}'
            writer.writerow([group.attrib['id'], permission.attrib['id'] if permission else None , description, item[2], ui.attrib['id'], attributes])

    with open('../data/permissions.csv', 'w', newline='') as csvfile:
        writer = csv.writer(csvfile, dialect='excel', delimiter=',', quoting=csv.QUOTE_MINIMAL)
        writer.writerow(['group','permission', 'group description', 'permission description'])
        for permission in permissions_list:
            writer.writerow([permission[0], permission[1], permission[2], permission[3]])

if __name__ == '__main__':
    main()