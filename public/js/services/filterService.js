'use strict';

app.factory('tempService', function() {
    return {
        appendhtml: function(elem, fileurl, videoFlag) {
            var retval = elem;
            retval += '<div class=\'col-sm-6 col-md-3\'>\n' +
                '<div class=\'thumbnail\' style=\"width:130px; height:180px;\">\n';
            if (videoFlag == 'video') {
                retval += '<video style=\"width: 120px;height: 120px;\">\n' +
                    '<source src=\"' + fileurl + '\" type=\"video/mp4\">\n' +
                    '</video>';
                retval += '<div class=\"Small_Shape4copy\" style=\"top:39px;\"><img src=\"images/Shape4copy.png\"></div>\n' +
                    '<a class=\"Small_Ellipse2\" style=\"top:35px;\" ng-click=\"DeleteModal1(\'' + fileurl + '\');\"><img src=\"images/Ellipse2.png\"></a>\n' +
                    '<h4 class=\'Small_Title\'>Vintage Filter</h3>\n' +
                    '</div></div>\n';

            } else if (videoFlag == 'image') {
                retval += '<img src=\"' + fileurl + '\"  class=\"thumbimg\" style=\"width:130px; height:130px;\" alt=\"Generic placeholder thumbnail\" >\n';
                retval += '<div class=\"Small_Shape4copy\" ><img src=\"images/Shape4copy.png\"></div>\n' +
                    '<a class=\"Small_Ellipse2\"  ng-click=\"DeleteModal1(\'' + fileurl + '\');\"><img src=\"images/Ellipse2.png\"></a>\n' +
                    '<h4 class=\'Small_Title\'>Vintage Filter</h3>\n' +
                    '</div></div>\n';

            }
            return retval;
        }
    };
});