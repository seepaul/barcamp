/* 
 * To change this template, choose Tools | Templates
 * and open the template in the editor.
 */
require.config({
  paths: {
    'jquery': './vendor/jquery'
  },
  "shim": {
    "vendor/highcharts/modules/exporting": ["vendor/highcharts/highcharts"],
    "vendor/jquery.validate.min": ["jquery"],
    "vendor/highcharts/highcharts": ["jquery"]
  }
});
