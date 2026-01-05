{
  "targets": [
    {
      "target_name": "swisseph",
      "sources": [
        "binding/swisseph_binding.cc",
        "libswe/sweph.c",
        "libswe/swephlib.c",
        "libswe/swedate.c",
        "libswe/swejpl.c",
        "libswe/swemmoon.c",
        "libswe/swemplan.c",
        "libswe/swehouse.c",
        "libswe/swecl.c",
        "libswe/swehel.c"
      ],
      "include_dirs": [
        "<!@(node -p \"require('node-addon-api').include\")",
        "libswe"
      ],
      "dependencies": [
        "<!(node -p \"require('node-addon-api').gyp\")"
      ],
      "cflags!": [ "-fno-exceptions" ],
      "cflags_cc!": [ "-fno-exceptions" ],
      "defines": [ "NAPI_DISABLE_CPP_EXCEPTIONS" ],
      "conditions": [
        ["OS=='mac'", {
          "xcode_settings": {
            "GCC_ENABLE_CPP_EXCEPTIONS": "YES",
            "GCC_ENABLE_CPP_RTTI": "YES",
            "CLANG_CXX_LIBRARY": "libc++",
            "CLANG_CXX_LANGUAGE_STANDARD": "c++14",
            "MACOSX_DEPLOYMENT_TARGET": "10.15",
            "OTHER_CPLUSPLUSFLAGS": [
              "-std=c++14",
              "-stdlib=libc++",
              "-isysroot",
              "<!@(xcrun --show-sdk-path)"
            ]
          },
          "cflags_cc": ["-std=c++14", "-stdlib=libc++"]
        }],
        ["OS=='linux'", {
          "cflags_cc": ["-std=c++14"]
        }],
        ["OS=='win'", {
          "msvs_settings": {
            "VCCLCompilerTool": {
              "ExceptionHandling": 1
            }
          }
        }]
      ]
    }
  ]
}
