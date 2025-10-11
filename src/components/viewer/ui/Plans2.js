import React from 'react';
import * as THREE from 'three';
import * as OBCF from "@thatopen/components-front";

export const setupPlans = async (components, world, model) => {
  try {
    const plans = components.get(OBCF.Plans);
    plans.world = world;
    await plans.generate(model);
    return plans;
  } catch (error) {
    console.error('Error setting up plans:', error);
    return null;
  }
};

export const Plans = ({ plans, activePlan, setActivePlan, world }) => {
  if (!plans?.list.length) return null;

  const handlePlanChange = async (planId) => {
    try {
      if (activePlan === planId) {
        plans.exitPlanView();
        setActivePlan(null);
        world.scene.three.background = null;
      } else {
        await plans.goTo(planId);
        setActivePlan(planId);
        world.scene.three.background = new THREE.Color("white");
      }
    } catch (error) {
      console.error('Error changing plan:', error);
    }
  };

  return (
    <div className="plans-panel absolute left-4 top-4 bg-white rounded-lg shadow-lg p-4">
      <h3 className="text-lg font-semibold mb-4 text-gray-800">Floor Plans</h3>
      <div className="space-y-2">
        {plans.list.map(plan => (
          <button
            key={plan.id}
            onClick={() => handlePlanChange(plan.id)}
            className={`w-full p-2 text-left rounded-lg transition-colors ${
              activePlan === plan.id 
                ? 'bg-blue-500 text-white' 
                : 'hover:bg-blue-50 text-gray-700'
            }`}
          >
            {plan.name}
          </button>
        ))}
      </div>
    </div>
  );
};