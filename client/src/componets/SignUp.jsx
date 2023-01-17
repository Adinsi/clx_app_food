import React, { useState } from 'react';

const SignUp = () => {
  const  [nom,setNom] = useState('')
  const  [prenom,setprenom] = useState('')
  const  [email,setemail] = useState('')
  const  [tel,settel] = useState('')
  const [password, setpassword] = useState('')
  console.log( {
    nom,prenom,email,tel,password
  })
  return (
    <div>
      <form>
        <input type='text' value={nom} onChange={(e) => setNom(e.target.value)} label='nom ' />
        <br></br>
        <input type='text' onChange={(e) => setprenom(e.target.value)} value={prenom} label='prenom ' />
        <br></br>
        <input type='email' onChange={(e) => setemail(e.target.value)} value={email} label='email ' />
        <br></br>
        <input type='tel' onChange={(e) => settel(e.target.value)} value={tel} label='tel ' />
        <br></br>
        <input type='paswword' onChange={(e)=>setpassword(e.target.value)}  value={password} label='Mot de passe ' />
      </form>
    </div>
  );
};

export default SignUp;