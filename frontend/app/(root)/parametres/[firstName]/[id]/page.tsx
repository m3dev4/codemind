import React from "react";

interface ParametrePageProps {
  params: {
    firstName: string;
    id: string;
  };
}

const ParametrePage = ({ params }: ParametrePageProps) => {
  return (
    <div className="p-6 text-white">
      <h1 className="text-2xl font-bold mb-4">Paramètres</h1>
      <div className="space-y-2">
        <p>Prénom: {params.firstName}</p>
        <p>ID: {params.id}</p>
      </div>
    </div>
  );
};

export default ParametrePage;
