// src/components/Almanaque.js
import React, { useState, useEffect } from 'react';
import { db, auth } from '../firebase';
import { doc, getDoc } from "firebase/firestore";
import { useParams } from 'react-router-dom';

const Almanaque = () => {
  const { spaceName } = useParams();  // Obtener el nombre del espacio desde los parámetros de la URL
  const [days, setDays] = useState([]);  // Lista de días en el mes
  const [selectedDay, setSelectedDay] = useState(null);
  const [hourlySchedule, setHourlySchedule] = useState(null);

  useEffect(() => {
    const fetchDaysInMonth = async () => {
      const currentYear = new Date().getFullYear();
      const currentMonth = new Date().getMonth() + 1;  // Obtenemos el mes actual

      const daysInMonth = new Date(currentYear, currentMonth, 0).getDate();
      const daysArray = Array.from({ length: daysInMonth }, (_, index) => index + 1);
      setDays(daysArray);
    };

    fetchDaysInMonth();
  }, []);

  const handleDayClick = async (day) => {
    const businessName = localStorage.getItem('businessName');
    const emailID = auth.currentUser.email.replace(/[@.]/g, "_");
    const currentYear = new Date().getFullYear();
    const currentMonth = new Date().getMonth() + 1;
    const dayString = day < 10 ? `0${day}` : `${day}`;

    try {
      // Path a Firestore para obtener los horarios del día seleccionado
      const docPath = `${businessName}/${emailID}/Espacios/${spaceName}/Almanaque/${currentYear}/${currentMonth}/${dayString}`;
      const docRef = doc(db, docPath);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        setSelectedDay(day);  // Guardamos el día seleccionado
        setHourlySchedule(docSnap.data());  // Guardamos el horario del día
      } else {
        console.log("No se encontró el almanaque para este día");
        setHourlySchedule(null);  // Si no hay datos, lo reiniciamos
      }
    } catch (error) {
      console.error("Error al obtener el almanaque: ", error);
    }
  };

  return (
    <div>
      <h2>Almanaque de {spaceName}</h2>
      <div>
        {/* Mostrar todos los días del mes */}
        {days.map((day) => (
          <button key={day} onClick={() => handleDayClick(day)}>
            Día {day}
          </button>
        ))}
      </div>
      {hourlySchedule && (
        <div>
          <h3>Franja Horaria del Día {selectedDay}</h3>
          <ul>
            {/* Mostramos las horas disponibles */}
            {Object.keys(hourlySchedule).map((hour) => (
              <li key={hour}>
                {hour}: {hourlySchedule[hour].Boked ? 'Reservado' : 'Disponible'}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default Almanaque;
