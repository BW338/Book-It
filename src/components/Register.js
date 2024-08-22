import React, { useState } from 'react';
import { auth, db } from '../firebase';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from "firebase/auth";
import { doc, setDoc, getDoc } from "firebase/firestore";
import { useNavigate } from 'react-router-dom';

const Register = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [isLogin, setIsLogin] = useState(false);  // Estado para alternar entre registro e inicio de sesión
  const navigate = useNavigate();

  // Función para manejar el registro
  const handleRegister = async (e) => {
    e.preventDefault();
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      const emailID = email.toLowerCase().replace(/[@.]/g, "_");

      // Guardar información del negocio en Firestore y localStorage
      await setDoc(doc(db, name, emailID), {
        owner: user.uid,
        email: email,
        name: name,
        address: "",
        spaces: [],
      });

      localStorage.setItem('businessName', name);

      navigate('/dashboard');
    } catch (error) {
      console.error("Error al registrar: ", error);
    }
  };

  // Función para manejar el inicio de sesión
  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // Guardar el nombre del negocio en localStorage basado en el correo electrónico
      const emailID = email.toLowerCase().replace(/[@.]/g, "_");
      // Aquí podrías obtener el nombre del negocio del Firestore si está guardado
      // Esto asume que el nombre del negocio está en un documento en Firestore
      const docRef = doc(db, "users", emailID);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        const businessName = docSnap.data().name;
        localStorage.setItem('businessName', businessName);
      } else {
        console.error("No se encontró el documento del usuario");
      }

      navigate('/dashboard');
    } catch (error) {
      console.error("Error al iniciar sesión: ", error);
    }
  };

  return (
    <div>
      <h2>{isLogin ? 'Iniciar Sesión' : 'Registrar Negocio'}</h2>
      <form onSubmit={isLogin ? handleLogin : handleRegister}>
        {!isLogin && (
          <input
            type="text"
            placeholder="Nombre del negocio"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        )}
        <input
          type="email"
          placeholder="Correo electrónico"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <input
          type="password"
          placeholder="Contraseña"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <button type="submit">{isLogin ? 'Iniciar Sesión' : 'Registrar'}</button>
      </form>
      <button onClick={() => setIsLogin(!isLogin)}>
        {isLogin ? 'Crear una cuenta' : 'Ya tienes una cuenta? Inicia sesión'}
      </button>
    </div>
  );
};

export default Register;
