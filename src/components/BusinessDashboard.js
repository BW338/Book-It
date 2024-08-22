import React, { useState, useEffect } from 'react';
import { db, auth } from '../firebase';
import { doc, getDoc, updateDoc, setDoc } from "firebase/firestore";
import { Link } from 'react-router-dom';  // Importar Link

const BusinessDashboard = () => {
  const [business, setBusiness] = useState(null);
  const [spaces, setSpaces] = useState([]);
  const [spaceNames, setSpaceNames] = useState([""]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBusinessData = async () => {
      if (!auth.currentUser) {
        console.log("No hay usuario autenticado");
        setLoading(false);
        return;
      }

      try {
        const email = auth.currentUser.email;
        const emailID = email.toLowerCase().replace(/[@.]/g, "_");
        const storedBusinessName = localStorage.getItem('businessName'); 

        if (!storedBusinessName) {
          console.error("No se encontró el nombre del negocio en localStorage");
          setLoading(false);
          return;
        }

        const docRef = doc(db, storedBusinessName, emailID);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          setBusiness(docSnap.data());
          setSpaces(docSnap.data().spaces || []);
        } else {
          console.log("No se encontró el documento del negocio");
        }
      } catch (error) {
        console.error("Error al obtener datos del negocio: ", error);
      } finally {
        setLoading(false);
      }
    };

    fetchBusinessData();
  }, []);

  const generateAlmanaque = async (businessName, spaceName) => {
    const currentYear = new Date().getFullYear();
    const currentMonth = new Date().getMonth() + 1;

    const daysInMonth = new Date(currentYear, currentMonth, 0).getDate();

    for (let day = 1; day <= daysInMonth; day++) {
      const dayString = day < 10 ? `0${day}` : `${day}`;
      const docPath = `${businessName}/${auth.currentUser.email.replace(/[@.]/g, "_")}/Espacios/${spaceName}/Almanaque/${currentYear}/${currentMonth}/${dayString}`;

      const dailySchedule = {};

      for (let hour = 9; hour <= 22; hour++) {
        const hourString = hour < 10 ? `0${hour}` : `${hour}`;
        dailySchedule[hourString] = { Boked: false };
      }

      await setDoc(doc(db, docPath), dailySchedule);
    }
  };

  const handleSpaceNameChange = (index, value) => {
    const newSpaceNames = [...spaceNames];
    newSpaceNames[index] = value;
    setSpaceNames(newSpaceNames);
  };

  const handleAddSpaces = async () => {
    try {
      const email = auth.currentUser.email;
      const emailID = email.toLowerCase().replace(/[@.]/g, "_");
      const storedBusinessName = localStorage.getItem('businessName'); 

      if (!storedBusinessName) {
        console.error("No se encontró el nombre del negocio en localStorage");
        return;
      }

      const updatedSpaces = [...spaces, ...spaceNames.map((name) => ({ name }))];
      
      const businessRef = doc(db, storedBusinessName, emailID);
      await updateDoc(businessRef, { spaces: updatedSpaces });

      for (const spaceName of spaceNames) {
        await generateAlmanaque(storedBusinessName, spaceName);
      }

      setSpaces(updatedSpaces);
      setSpaceNames([""]); 
    } catch (error) {
      console.error("Error al agregar espacio: ", error);
    }
  };

  if (loading) {
    return <div>Cargando...</div>;
  }

  return (
    <div>
      <h2>Dashboard de {business?.name}</h2>
      <div>
        <label>Número de canchas:</label>
        <select onChange={(e) => setSpaceNames([...Array(parseInt(e.target.value)).fill("")])}>
          {[...Array(10).keys()].map(num => (
            <option key={num} value={num + 1}>{num + 1}</option>
          ))}
        </select>
      </div>
      {spaceNames.map((_, index) => (
        <div key={index}>
          <input
            type="text"
            placeholder={`Nombre de la cancha ${index + 1}`}
            value={spaceNames[index]}
            onChange={(e) => handleSpaceNameChange(index, e.target.value)}
          />
        </div>
      ))}
      <button onClick={handleAddSpaces}>Agregar Espacios</button>
      <ul>
        {spaces.map((space, index) => (
          <li key={index}>{space.name}</li>
        ))}
      </ul>
      <ul>
  {spaces.map((space, index) => (
    <li key={index}>
      {space.name}
      <Link to={`/almanaque/${space.name}`}>
        <button>Ver Almanaque</button>
      </Link>
    </li>
  ))}
</ul>
    </div>
  );
};

export default BusinessDashboard;
