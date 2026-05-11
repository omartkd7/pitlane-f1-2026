import React from 'react';
import { useParams } from 'react-router-dom';

export const RaceDetails = () => {
  const { raceId } = useParams();
  return (
    <div className="page race-details">
      <h1>Détails de la course : {raceId}</h1>
      <p>Informations spécifiques sur le Grand Prix.</p>
    </div>
  );
};
