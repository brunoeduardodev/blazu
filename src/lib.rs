#[macro_use]
extern crate napi_derive;

use std::{fs, path};

use napi::{bindgen_prelude::Null, *};
use serde::ser;

#[module_exports]
fn init(mut exports: JsObject) -> Result<()> {
  exports.create_named_method("serialize_json", serialize_json)?;

  Ok(())
}

fn serde_json_to_napi_array(ctx: &CallContext, arr: Vec<serde_json::Value>) -> napi::JsObject {
  let mut res = ctx.env.create_object().unwrap();
  let mut i = 0;

  for value in arr {
    match value {
      serde_json::Value::String(s) => match res.set(i.to_string(), ctx.env.create_string(&s)) {
        Ok(_) => {}
        Err(e) => {
          println!("{}", e);
        }
      },
      serde_json::Value::Number(n) => {
        match res.set(i.to_string(), ctx.env.create_double(n.as_f64().unwrap())) {
          Ok(_) => {}
          Err(e) => {
            println!("{}", e);
          }
        }
      }
      serde_json::Value::Bool(b) => match res.set(i.to_string(), b) {
        Ok(_) => {}
        Err(e) => {
          println!("{}", e);
        }
      },
      serde_json::Value::Null => match res.set(i.to_string(), ctx.env.get_null()) {
        Ok(_) => {}
        Err(e) => {
          println!("{}", e);
        }
      },
      serde_json::Value::Object(field_obj) => {
        let obj = serde_json_to_napi_object(ctx, field_obj);
        match res.set(i.to_string(), obj) {
          Ok(_) => {}
          Err(e) => {
            println!("{}", e);
          }
        }
      }
      serde_json::Value::Array(field_arr) => {
        let arr = serde_json_to_napi_array(ctx, field_arr);
        match res.set(i.to_string(), arr) {
          Ok(_) => {}
          Err(e) => {
            println!("{}", e);
          }
        }
      }
    }
    i = i + 1;
  }
  res
}

fn serde_json_to_napi_object(
  ctx: &CallContext,
  json: serde_json::Map<String, serde_json::Value>,
) -> JsObject {
  let mut res = ctx.env.create_object().unwrap();

  for (key, value) in json {
    match value {
      serde_json::Value::String(s) => match res.set(key, ctx.env.create_string(&s)) {
        Ok(_) => {}
        Err(e) => {
          println!("{}", e);
        }
      },
      serde_json::Value::Number(n) => {
        match res.set(key, ctx.env.create_double(n.as_f64().unwrap())) {
          Ok(_) => {}
          Err(e) => {
            println!("{}", e);
          }
        }
      }
      serde_json::Value::Bool(b) => match res.set(key, b) {
        Ok(_) => {}
        Err(e) => {
          println!("{}", e);
        }
      },
      serde_json::Value::Null => match res.set(key, ctx.env.get_null()) {
        Ok(_) => {}
        Err(e) => {
          println!("{}", e);
        }
      },
      serde_json::Value::Object(field_obj) => {
        let obj = serde_json_to_napi_object(ctx, field_obj);
        match res.set(key, obj) {
          Ok(_) => {}
          Err(e) => {
            println!("{}", e);
          }
        }
      }
      serde_json::Value::Array(field_arr) => {
        let arr = serde_json_to_napi_array(ctx, field_arr);
        match res.set(key, arr) {
          Ok(_) => {}
          Err(e) => {
            println!("{}", e);
          }
        }
      }
    }
  }

  res
}

#[js_function]
fn serialize_json(ctx: CallContext) -> Result<JsObject> {
  let content = fs::read_to_string(path::Path::new("./blazu_5mb.json"))?.to_string();
  let content2: &str = &content;

  let obj: serde_json::Value = serde_json::from_str(content2).unwrap();

  match obj {
    serde_json::Value::Object(field_obj) => {
      let obj = serde_json_to_napi_object(&ctx, field_obj);
      return Ok(obj);
    }
    serde_json::Value::Array(field_arr) => {
      let arr = serde_json_to_napi_array(&ctx, field_arr);
      return Ok(arr);
    }
    _ => {
      return Ok(ctx.env.create_object().unwrap());
    }
  }
}
