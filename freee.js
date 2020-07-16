var now   = new Date();
//年
var year  = now.getFullYear();
//月
var month = now.getMonth() + 1;
//日
var day   = now.getDate();
var company_id = 2530020;
var token = 'cb22f1ecef3dc8d792f92313a1161378b2ba4738ad895012ea26aca99149ffbe';
//メソッドにPOSTを指定しログイン情報を設定
var options = {
    'method' : 'GET',
    'headers' : {
        'Authorization':'Bearer ' + token,
        'accept': 'application/json'
    }
};


function myFunction() {
    //アクセス先URLにGETクエストを送信し、レスポンスを取得
    var response = UrlFetchApp.fetch('https://api.freee.co.jp/hr/api/v1/companies/' + company_id + '/employees', options).getContentText();

    //JSON形式に直す
    var resBs = JSON.parse(response);

    var cnt = resBs.length;
    for(i = 0; i < cnt ; i++ ){
        var emp_id = resBs[i].id;
        totalTime(emp_id)
    }

}
//従業員ごとの残業時間を算出
function totalTime(emp_id){

    //GET先の設定
    var url = 'https://api.freee.co.jp/hr/api/v1/employees/' + emp_id + '/work_record_summaries/' + year + '/' + month + '?company_id=' + company_id + '&work_records=true';

    var response = UrlFetchApp.fetch(url, options).getContentText();
    //JSON形式に直す
    var resBs = JSON.parse(response);
var overtime_work_minute = 0;

    //配列の数を取得
    var cnt = resBs['work_records'].length;
    for(i = 0; i < cnt ; i++ ){
        var workDate = resBs['work_records'][i].date;
        var workYear = workDate.substr( 0, 4 );
        var workMonth = workDate.substr( 5, 2 );
        var workDay = workDate.substr( 8, 2 );
        var getDate = new Date(workYear, workMonth,workDay);

        //今月か確認するif文
        if(workMonth == month){
            //月内のデータであれば残業時間を追加していく
            overtime_work_minute += parseFloat(resBs['work_records'][i].total_overtime_work_mins);
        }
    }
    overtime_work_hour = overtime_work_minute / 60;

    //合計値が20時間を超えていればのif文
    if(overtime_work_hour >= 40){
        sentence =  overtime_work_hour+ "残業時間あなたの残業時間のライフは0よ。";
        postSlack(sentence)
    } else if(overtime_work_hour >= 30){
        sentence = "合計残業" + overtime_work_hour+ "時間。残業せず帰りましょう。";
        postSlack(sentence)
    } else if(overtime_work_hour >= 20){
        sentence = "合計残業" + overtime_work_hour+ "時間です。36協定を忘れずに";
        postSlack(sentence)
    }
}

function postSlack(sentence) {


    var slackPayload  = {
        'text'      : sentence
    };
    var slackOptions = {
        'method'      : 'post',
        'contentType' : 'application/json',
        'payload'     : JSON.stringify(slackPayload),
    };
    var slackUrl = 'Slack_url';
    UrlFetchApp.fetch(slackUrl, slackOptions);

}