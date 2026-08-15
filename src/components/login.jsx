import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "../App.css"

function Login(){

    const [name, setname] = useState("");
    const [password, setpassword] = useState("");
    const [student, setStudents] = useState([]);

    const navigate = useNavigate();

    const users = [
        {
            name: "nitesh",
            password: "123"
        },
        {
            name: "simi",
            password: "659"
        }
    ];


    function fetchStudents(){
        fetch("https://student-management-system-4-hose.onrender.com/api/students")
        .then((response)=> response.json())
        .then((data)=>{
            console.log(data);
            setStudents(data.students);
        });
    }


    useEffect(()=>{
        fetchStudents();
    },[]);



    function handleSubmit(e){

        e.preventDefault();

        const user = users.find(
            (u)=> u.name === name && u.password === password
        );


        if(user){
            alert("Login Successful");
            navigate("/customerside");
        }
        else{
            alert("Invalid Credential");
        }

    }


    return(
        <div className="studentslist">

          <table  className="studentable" style={{border: "2px solid black", marginBottom: "20px", width:"1070px"}}>
    <thead>
        <tr>
            <th>ID</th>
            <th>Name</th>
            <th>Mobile</th>
            <th>Address</th>
        </tr>
    </thead>

    <tbody>
        {
        student.map((student)=>(
            <tr key={student.id}>
                <td>{student.id}</td>
                <td  style={{fontSize:"19px",fontWeight: "bold"}}>{student.name}</td>
                <td>{student.mobile}</td>
                <td>{student.address}</td>
            </tr>
        ))
        }
    </tbody>
</table>

            <input 
                type="text"
                value={name}
                onChange={(e)=>setname(e.target.value)}
                placeholder="Enter your name"
            />


            <input 
                type="password"
                value={password}
                onChange={(e)=>setpassword(e.target.value)}
                placeholder="Enter password"
            />


            <button onClick={handleSubmit}>
                Submit
            </button>

        </div>
    );

}

export default Login;