function AIExamXBlock(runtime, element) {
    const video = $('#ovideo')[0];
    const canvas = $('<canvas>')[0];
    const context = canvas.getContext('2d');
    const MAX_WIDTH = 480;
    const MAX_HEIGHT = 360;
    var studentID;
    var courseID;
    var accessToken;
    var attendanceID;

    let imageLists = [];
    const aiserver = "https://aiserver.daotao.ai/api/v1/invigilation/";

    var settings = {
        video: true,
        audio: false  
    };

    function getStudent() {
        var handlerUrl = runtime.handlerUrl(element, 'get_user_info');
        $.ajax({
            method: "POST",
            url: handlerUrl,
            data: JSON.stringify({}),
            success: getStudentID
        });
    }

    function getStudentID(res) {

        console.log(res);

        studentID = res.user_info.username;
        userIsStaff = res.user_info.user_is_staff;

        getAttendaceID()
    }

    function getCourse() {
        const currentUrl = window.location.href;
        const match = currentUrl.match(/courses\/([^/]+)/);
        courseID = match ? match[1] : null;

    }

    async function login() {
        var settings = {
            "url": "https://aiserver.daotao.ai/api/v1/login/access-token",
            "method": "POST",
            "timeout": 0,
            "headers": {
                "accept": "application/json",
                "Content-Type": "application/x-www-form-urlencoded"
            },
            "data": {
                "grant_type": "",
                "username": "edtech",
                "password": "hMJzj6Vb79WB",
                "scope": "",
                "client_id": "",
                "client_secret": ""
            }
        };
        return new Promise((resolve, reject) => {
            $.ajax(settings).done(function (response) {
                resolve(response);
            }).fail(function (jqXHR, textStatus, errorThrown) {
                reject(new Error('AJAX Error: ' + textStatus + ': ' + errorThrown));
            });
        });
    }

    async function getAccessToken() {

        try {
            const response = await login();
            accessToken = response.access_token;

        } catch (error) {
            console.error("Failed to login and get access token:", error);
        }
    }

    getCourse()
    getStudent()


    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        navigator.mediaDevices.getUserMedia(settings)
            .then(function (stream) {
                video.srcObject = stream;

                video.play();
            })
            .catch(function (error) {
                console.error('Unable to access the webcam: ', error);
                alert('Webcam access is not supported or denied.');
            });
    } else {
        console.error('Webcam access is not supported in this browser.');
        alert('Webcam access is not supported in this browser.');
    }


    async function getAttendaceID() {

        await getAccessToken()

        const Auth = 'Bearer ' + accessToken;
        const apiURL = 'https://aiserver.daotao.ai/api/v1/attendances/read_attendance_by_student_and_course?student_id=' + studentID + '&course_id=' + encodeURIComponent(courseID);

        $.ajax({
            type: "GET",
            url: apiURL,
            contentType: "application/json",
            headers: {
                "Access-Control-Allow-Origin": "*",
                "Access-Control-Allow-Headers": "*",
                "Authorization": Auth
            },

            success: function (response) {
                attendanceID = response.id
            },
            error: function (xhr, status, error) {
                console.error(xhr.responseText);
            }
        });
    }


    // function imagesCollector() {
    //     canvas.width = MAX_WIDTH;
    //     canvas.height = MAX_HEIGHT;
    //     context.drawImage(video, 0, 0, canvas.width, canvas.height);

    //     const imageUrl = canvas.toDataURL('image/jpeg', 0.7);

    //     imageLists.push(imageUrl);
    //     if (imageLists.length >= 6) {
    //         const Auth = 'Bearer ' + accessToken;
    //         $.ajax({
    //             type: "POST",
    //             url: aiserver,
    //             contentType: "application/json",
    //             headers: {
    //                 "Access-Control-Allow-Origin": "*",
    //                 "Access-Control-Allow-Headers": "*",
    //                 "Authorization": Auth
    //             },
    //             data: JSON.stringify({
    //                 attendance_id: attendanceID,
    //                 student_id: studentID,
    //                 portraits: imageLists
    //             }),
    //             success: function (response) {
    //                 console.log("Photos uploaded successfully!");
    //                 console.log(response);
    //             },
    //             error: function (xhr, status, error) {
    //                 console.error("Error uploading photos." + xhr.responseText);
    //             }
    //         });
    //         imageLists = [];
    //     }
    // }

    // setTimeout(function () {
    //     setInterval(imagesCollector, 3000);
    // }, 5000);

    $(window).on("beforeunload", function () {
        localStorage.removeItem("attendance_id");
    });
}

function AIExamStudioXBlock(runtime, element) {

}