public with sharing class Feeds {
  @RemoteAction
  public static Map<String, Object> getObjectsAttributes(String[] object_names) {
    Map<String, Object> results = new Map<String, Object>();
    for (String object_name : object_names) {
      Schema.DescribeSObjectResult o = Schema.getGlobalDescribe().get(object_name).getDescribe();
      Map<String, Object> oi = new Map<String, Object>{ 'attribute' => o };

      Map<String, Object> fs = new Map<String, Object>();
      Map<String, Schema.SObjectField> fsm = o.fields.getMap();

      for (String k : fsm.keySet()) fs.put(k, fsm.get(k).getDescribe());
      oi.put('fields', fs);

      results.put(o.name, oi);
    }
    return results;
  }

  @RemoteAction
  public static map<string, object> retrieveAttachment(String object_name, String[] fields, Map<String,Object> criteria) {
    String[] fs = new String[0];
    for (String f : fields) {
      if (f.equals('Body')) continue;
      fs.add(f);
    }
    return RemoteObjectController.retrieve(object_name, fs, criteria);
  }

  @RemoteAction
  public static map<string, object> createAttachment(String object_name, Map<String, Object> fields) {
    return RemoteObjectController.create(
      object_name,
      new Map<String, Object>{
        'Body' => EncodingUtil.base64Decode((String) fields.get('Body')),
        'ContentType' => fields.get('ContentType'),
        'Name' => fields.get('Name'),
        'ParentId' => fields.get('ParentId')
      }
    );
  }

  @RemoteAction
  public static map<string, object> updateAttachment(String object_name, String[] record_ids, Map<String, Object> fields) {
    Attachment a = [SELECT Id, Body FROM Attachment WHERE Id = :record_ids.get(0)];

    return RemoteObjectController.updat(
      object_name,
      record_ids,
      new Map<String, Object>{
        'Body' => EncodingUtil.base64Decode(EncodingUtil.base64Encode(a.Body) + (String) fields.get('Body'))
      }
    );
  }
}
