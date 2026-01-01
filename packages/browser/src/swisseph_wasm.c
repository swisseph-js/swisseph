#include <emscripten.h>
#include <string.h>
#include "swephexp.h"

// Export functions to JavaScript

EMSCRIPTEN_KEEPALIVE
void swe_set_ephe_path_wrap(const char *path) {
    swe_set_ephe_path(path);
}

EMSCRIPTEN_KEEPALIVE
double swe_julday_wrap(int year, int month, int day, double hour, int gregflag) {
    return swe_julday(year, month, day, hour, gregflag);
}

EMSCRIPTEN_KEEPALIVE
void swe_revjul_wrap(double jd, int gregflag, int *year, int *month, int *day, double *hour) {
    swe_revjul(jd, gregflag, year, month, day, hour);
}

EMSCRIPTEN_KEEPALIVE
int swe_calc_ut_wrap(double tjd_ut, int ipl, int iflag, double *xx, char *serr) {
    return swe_calc_ut(tjd_ut, ipl, iflag, xx, serr);
}

EMSCRIPTEN_KEEPALIVE
char* swe_get_planet_name_wrap(int ipl) {
    static char name[256];
    swe_get_planet_name(ipl, name);
    return name;
}

EMSCRIPTEN_KEEPALIVE
int swe_lun_eclipse_when_wrap(double tjd_start, int ifl, int ifltype, double *tret, int backward, char *serr) {
    return swe_lun_eclipse_when(tjd_start, ifl, ifltype, tret, backward, serr);
}

EMSCRIPTEN_KEEPALIVE
int swe_sol_eclipse_when_glob_wrap(double tjd_start, int ifl, int ifltype, double *tret, int backward, char *serr) {
    return swe_sol_eclipse_when_glob(tjd_start, ifl, ifltype, tret, backward, serr);
}

EMSCRIPTEN_KEEPALIVE
int swe_houses_wrap(double tjd_ut, double geolat, double geolon, int hsys, double *cusps, double *ascmc) {
    return swe_houses(tjd_ut, geolat, geolon, hsys, cusps, ascmc);
}

EMSCRIPTEN_KEEPALIVE
void swe_close_wrap(void) {
    swe_close();
}

EMSCRIPTEN_KEEPALIVE
char* swe_version_wrap(void) {
    static char version[256];
    swe_version(version);
    return version;
}
