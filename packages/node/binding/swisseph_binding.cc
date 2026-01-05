#include <cstdint>
#include <napi.h>
#include "swephexp.h"
#include <cstring>

// Wrapper for swe_set_ephe_path
Napi::Value SetEphePath(const Napi::CallbackInfo& info) {
  Napi::Env env = info.Env();

  if (info.Length() < 1) {
    // If no argument provided, set to NULL (use default path)
    swe_set_ephe_path(NULL);
    return env.Undefined();
  }

  if (!info[0].IsString()) {
    Napi::TypeError::New(env, "String expected").ThrowAsJavaScriptException();
    return env.Undefined();
  }

  std::string path = info[0].As<Napi::String>().Utf8Value();
  swe_set_ephe_path(path.c_str());

  return env.Undefined();
}

// Wrapper for swe_julday
Napi::Value Julday(const Napi::CallbackInfo& info) {
  Napi::Env env = info.Env();

  if (info.Length() < 4) {
    Napi::TypeError::New(env, "Expected 4 or 5 arguments: year, month, day, hour, [gregflag]")
        .ThrowAsJavaScriptException();
    return env.Undefined();
  }

  int year = info[0].As<Napi::Number>().Int32Value();
  int month = info[1].As<Napi::Number>().Int32Value();
  int day = info[2].As<Napi::Number>().Int32Value();
  double hour = info[3].As<Napi::Number>().DoubleValue();
  int gregflag = info.Length() >= 5 ? info[4].As<Napi::Number>().Int32Value() : SE_GREG_CAL;

  double jd = swe_julday(year, month, day, hour, gregflag);

  return Napi::Number::New(env, jd);
}

// Wrapper for swe_revjul
Napi::Value Revjul(const Napi::CallbackInfo& info) {
  Napi::Env env = info.Env();

  if (info.Length() < 1) {
    Napi::TypeError::New(env, "Expected Julian day number")
        .ThrowAsJavaScriptException();
    return env.Undefined();
  }

  double jd = info[0].As<Napi::Number>().DoubleValue();
  int gregflag = info.Length() >= 2 ? info[1].As<Napi::Number>().Int32Value() : SE_GREG_CAL;

  int year, month, day;
  double hour;

  swe_revjul(jd, gregflag, &year, &month, &day, &hour);

  Napi::Array result = Napi::Array::New(env, 4);
  result[0u] = Napi::Number::New(env, year);
  result[1u] = Napi::Number::New(env, month);
  result[2u] = Napi::Number::New(env, day);
  result[3u] = Napi::Number::New(env, hour);

  return result;
}

// Wrapper for swe_calc_ut
Napi::Value CalcUt(const Napi::CallbackInfo& info) {
  Napi::Env env = info.Env();

  if (info.Length() < 2) {
    Napi::TypeError::New(env, "Expected Julian day and planet number")
        .ThrowAsJavaScriptException();
    return env.Undefined();
  }

  double tjd_ut = info[0].As<Napi::Number>().DoubleValue();
  int32 ipl = info[1].As<Napi::Number>().Int32Value();
  int32 iflag = info.Length() >= 3 ? info[2].As<Napi::Number>().Int32Value() : SEFLG_SWIEPH | SEFLG_SPEED;

  double xx[6];
  char serr[256];

  int32 ret = swe_calc_ut(tjd_ut, ipl, iflag, xx, serr);

  if (ret < 0) {
    Napi::Error::New(env, serr).ThrowAsJavaScriptException();
    return env.Undefined();
  }

  Napi::Array xxArray = Napi::Array::New(env, 6);
  for (int i = 0; i < 6; i++) {
    xxArray[i] = Napi::Number::New(env, xx[i]);
  }

  Napi::Array result = Napi::Array::New(env, 2);
  result[0u] = xxArray;
  result[1u] = Napi::Number::New(env, ret);

  return result;
}

// Wrapper for swe_close
Napi::Value Close(const Napi::CallbackInfo& info) {
  Napi::Env env = info.Env();
  swe_close();
  return env.Undefined();
}

// Wrapper for swe_get_planet_name
Napi::Value GetPlanetName(const Napi::CallbackInfo& info) {
  Napi::Env env = info.Env();

  if (info.Length() < 1) {
    Napi::TypeError::New(env, "Expected planet number")
        .ThrowAsJavaScriptException();
    return env.Undefined();
  }

  int ipl = info[0].As<Napi::Number>().Int32Value();
  char name[256];

  swe_get_planet_name(ipl, name);

  return Napi::String::New(env, name);
}

// Wrapper for swe_lun_eclipse_when
Napi::Value LunEclipseWhen(const Napi::CallbackInfo& info) {
  Napi::Env env = info.Env();

  if (info.Length() < 1) {
    Napi::TypeError::New(env, "Expected starting Julian day")
        .ThrowAsJavaScriptException();
    return env.Undefined();
  }

  double tjd_start = info[0].As<Napi::Number>().DoubleValue();
  int32 ifl = info.Length() >= 2 ? info[1].As<Napi::Number>().Int32Value() : SEFLG_SWIEPH;
  int32 ifltype = info.Length() >= 3 ? info[2].As<Napi::Number>().Int32Value() : 0;
  int32 backward = info.Length() >= 4 ? info[3].As<Napi::Number>().Int32Value() : 0;

  double tret[10];
  char serr[256];

  int32 ret = swe_lun_eclipse_when(tjd_start, ifl, ifltype, tret, backward, serr);

  if (ret < 0) {
    Napi::Error::New(env, serr).ThrowAsJavaScriptException();
    return env.Undefined();
  }

  Napi::Array tretArray = Napi::Array::New(env, 10);
  for (int i = 0; i < 10; i++) {
    tretArray[i] = Napi::Number::New(env, tret[i]);
  }

  Napi::Array result = Napi::Array::New(env, 2);
  result[0u] = Napi::Number::New(env, ret);
  result[1u] = tretArray;

  return result;
}

// Wrapper for swe_sol_eclipse_when_glob
Napi::Value SolEclipseWhenGlob(const Napi::CallbackInfo& info) {
  Napi::Env env = info.Env();

  if (info.Length() < 1) {
    Napi::TypeError::New(env, "Expected starting Julian day")
        .ThrowAsJavaScriptException();
    return env.Undefined();
  }

  double tjd_start = info[0].As<Napi::Number>().DoubleValue();
  int32 ifl = info.Length() >= 2 ? info[1].As<Napi::Number>().Int32Value() : SEFLG_SWIEPH;
  int32 ifltype = info.Length() >= 3 ? info[2].As<Napi::Number>().Int32Value() : 0;
  int32 backward = info.Length() >= 4 ? info[3].As<Napi::Number>().Int32Value() : 0;

  double tret[10];
  char serr[256];

  int32 ret = swe_sol_eclipse_when_glob(tjd_start, ifl, ifltype, tret, backward, serr);

  if (ret < 0) {
    Napi::Error::New(env, serr).ThrowAsJavaScriptException();
    return env.Undefined();
  }

  Napi::Array tretArray = Napi::Array::New(env, 10);
  for (int i = 0; i < 10; i++) {
    tretArray[i] = Napi::Number::New(env, tret[i]);
  }

  Napi::Array result = Napi::Array::New(env, 2);
  result[0u] = Napi::Number::New(env, ret);
  result[1u] = tretArray;

  return result;
}

// Wrapper for swe_houses
Napi::Value Houses(const Napi::CallbackInfo& info) {
  Napi::Env env = info.Env();

  if (info.Length() < 3) {
    Napi::TypeError::New(env, "Expected tjd_ut, geolat, geolon, [hsys]")
        .ThrowAsJavaScriptException();
    return env.Undefined();
  }

  double tjd_ut = info[0].As<Napi::Number>().DoubleValue();
  double geolat = info[1].As<Napi::Number>().DoubleValue();
  double geolon = info[2].As<Napi::Number>().DoubleValue();
  int hsys = info.Length() >= 4 ? info[3].As<Napi::String>().Utf8Value()[0] : 'P';

  double cusps[13];
  double ascmc[10];

  int ret = swe_houses(tjd_ut, geolat, geolon, hsys, cusps, ascmc);

  if (ret < 0) {
    Napi::Error::New(env, "Failed to calculate houses").ThrowAsJavaScriptException();
    return env.Undefined();
  }

  Napi::Array cuspsArray = Napi::Array::New(env, 13);
  for (int i = 0; i < 13; i++) {
    cuspsArray[i] = Napi::Number::New(env, cusps[i]);
  }

  Napi::Array ascmcArray = Napi::Array::New(env, 10);
  for (int i = 0; i < 10; i++) {
    ascmcArray[i] = Napi::Number::New(env, ascmc[i]);
  }

  Napi::Array result = Napi::Array::New(env, 2);
  result[0u] = cuspsArray;
  result[1u] = ascmcArray;

  return result;
}

// Initialize the addon
Napi::Object Init(Napi::Env env, Napi::Object exports) {
  exports.Set("set_ephe_path", Napi::Function::New(env, SetEphePath));
  exports.Set("julday", Napi::Function::New(env, Julday));
  exports.Set("revjul", Napi::Function::New(env, Revjul));
  exports.Set("calc_ut", Napi::Function::New(env, CalcUt));
  exports.Set("close", Napi::Function::New(env, Close));
  exports.Set("get_planet_name", Napi::Function::New(env, GetPlanetName));
  exports.Set("lun_eclipse_when", Napi::Function::New(env, LunEclipseWhen));
  exports.Set("sol_eclipse_when_glob", Napi::Function::New(env, SolEclipseWhenGlob));
  exports.Set("houses", Napi::Function::New(env, Houses));

  return exports;
}

NODE_API_MODULE(swisseph, Init)
