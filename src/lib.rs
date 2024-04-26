#![deny(clippy::all)]

use napi::{JsObject, JsUnknown};

#[macro_use]
extern crate napi_derive;

#[napi]
pub fn sum(a: i32, b: i32) -> i32 {
  a + b
}

#[napi]
pub fn fibonacci(steps: i32) -> i32 {
  let mut a = 0;
  let mut b = 1;
  for _ in 0..steps {
    let c = a + b;
    a = b;
    b = c;
  }
  b
}


#[napi]
pub fn parse_json(json: String) -> JsUnknown {
  let map = serde_json::from_str(&json).unwrap();
  map
}