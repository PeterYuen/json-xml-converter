import json
import xmltodict


def json_to_xml(json_str: str, root_name: str = "root") -> str:
    try:
        data = json.loads(json_str)
    except json.JSONDecodeError as e:
        raise ValueError(f"Invalid JSON: {e}")
    if not isinstance(data, dict):
        data = {"_content": data}
    return xmltodict.unparse({root_name: data}, pretty=True, indent="  ")


def xml_to_json(xml_str: str) -> str:
    try:
        obj = xmltodict.parse(xml_str.strip())
    except Exception as e:
        raise ValueError(f"Invalid XML: {e}")
    return json.dumps(obj, ensure_ascii=False, indent=2)
