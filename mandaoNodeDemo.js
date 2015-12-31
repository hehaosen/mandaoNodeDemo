// +------------------------------------------------------------------------------------------
// | Author: Tom <307052084@qq.com.com>
// +------------------------------------------------------------------------------------------
// | Forget youself
// +------------------------------------------------------------------------------------------
// | Description: 漫道短些接口NodeDemo Dates: 2015-09-23
// +------------------------------------------------------------------------------------------
var request = require('superagent');
var iconv = require('iconv-lite');
var md5 = require('md5');
var parseString = require('xml2js').parseString;

var note = {
    conf : {
        /** 序列号 */
        sn : '',

        /** 密码 */
        pwd : '',

        /** 主服务器地址 支持的端口包括：80，8060，8061对应相应服务，优先8060端口 */
        serverMaster : 'sdk.entinfo.cn:8060/webservice.asmx/mdSmsSend',

        /** 备用服务器地址 支持的端口包括：80，8060，8061对应相应服务，优先8060端口*/
        serverBackup : 'sdk2.entinfo.cn:8060/webservice.asmx/mdSmsSend',

        /** 端口号 */
        port : '8060',

        /** 短信反馈信息 */
        Msg : '',

        /** 发送信息 0 为失败 1为成功 */

        status : 0
    },
    /**
     * 发送短信
     *
     * @return void
     */
    sendnote: function (mobiles, content, time, callback) {

        //请参考    content + '[Tom]';,//短信内容
        // Sn		软件序列号	是	格式XXX-XXX-XXX-XXXXX
        // Pwd		密码		是	md5(sn+password) 32位大写密文
        // Mobile	手机号		是	必填(支持10000个手机号,建议<=5000)多个英文逗号隔开 多个用英文的逗号隔开 post理论没有长度限制.推荐群发一次小于等于10000个手机号
        // Content	内容		是	支持长短信(详细请看长短信扣费说明)提交短信记得加签名 如果是utf-8,转成GB2312 70个字一条
        // Ext		扩展码		否	例如：123（默认置空）
        // stime	定时时间	否	例如：2010-12-29 16:27:03（非定时置空）
        // Rrid		唯一标识	否	最长18位，只能是数字或者 字母 或者数字+字母的组合


        var _self = this;

        var argv = {
            Sn : _self.conf.sn,
            Pwd : md5(_self.conf.sn + _self.conf.pwd).toUpperCase(),
            Mobile : '',
            Content : '',
            Ext : '',
            Stime : '',
            Rrid : ''
        }

        if (typeof (mobiles) !== null) {
            argv.Mobile = mobiles;
        } else {
            _self.conf.msg = '参数错误-手机号为空';
        }

        if (typeof (content) !== null) {
            argv.Content = iconv.encode(content + '[Tom]', 'gbk').toString();
        } else {
            _self.conf.msg = '参数错误-内容为空';
        }

        if (typeof (time) !== null) {
            argv.Stime = time ;
        }

        request.post(_self.conf.serverMaster)
            .type('form')
            .send({sn : argv.Sn, Pwd : argv.Pwd, Mobile : argv.Mobile, Content : argv.Content, Ext : argv.Ext, Stime : argv.Stime, Rrid : argv.Rrid})
            .end(function (err,res) {

                if (err !== null) {
                    _self.conf.msg = '发送短信失败:错误代码：XO';
                } else {
                    parseString(res.req.res.text, function (err, result) {

                        if (result.string._ > 0) {
                            _self.conf.status = 1;
                            _self.conf.msg = '发送成功';
                        }else{
                            _self.conf.msg = '发送短信失败:错误代码:' + result.string._ ;
                        }
                    });
                }
                callback({
                    status : _self.conf.status,
                    msg : _self.conf.msg
                });
            });
    }
}
