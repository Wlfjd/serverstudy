//express 라이브러리 사용법
const express = require('express')
const app=express()

//서버 띄우는 코드 app.listen(포트번호) = 내 컴퓨터 PORT 하나 오픈
app.listen(8080,()=>{
    console.log('http://localhost:8080 에서 서버 실행중')
})
S
//서버 기능 - 메인페이지 접속 시 hello를 유저에게 보내기
app.get('/',(require,response)=>{
    response.send('hello')
})