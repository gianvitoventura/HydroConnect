import React from 'react';

export const Plans = ({ plans, world, activePlan, onPlanChange }) => {
  if (!plans || !world) return null;

  return (
    <div className="plans-panel">
      <h3 className="plans-header">Floor Plans</h3>
      <div className="plans-list">
        {plans.list.map(plan => (
          <button
            key={plan.id}
            onClick={() => onPlanChange(plan.id)}
            className={`plan-button ${activePlan === plan.id ? 'active' : ''}`}
          >
            {plan.name}
          </button>
        ))}
      </div>
      
      {activePlan && (
        <button 
          className="exit-plan-button"
          onClick={() => onPlanChange(null)}
        >
          Esci dalla vista in pianta
        </button>
      )}
    </div>
  );
};