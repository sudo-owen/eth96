// Utility functions for handling tuple structures
export const flattenInputs = (inputs) => {
  const flattened = [];

  inputs.forEach((input, idx) => {
    if (input.type === 'tuple' && input.components) {
      input.components.forEach((component, compIdx) => {
        flattened.push({
          ...component,
          parentIndex: idx,
          componentIndex: compIdx,
          fullPath: `${input.name}.${component.name}`,
          parentName: input.name,
          isComponent: true,
          originalInput: input
        });
      });
    } else {
      flattened.push({
        ...input,
        parentIndex: idx,
        fullPath: input.name,
        isComponent: false
      });
    }
  });

  return flattened;
};

export const reconstructTupleArgs = (inputs, formState) => {
  const args = [];
  const types = [];

  inputs.forEach((input, idx) => {
    if (input.type === 'tuple' && input.components) {
      // Reconstruct tuple from individual component values
      const tupleValue = input.components.map((component, compIdx) => {
        const value = formState[`${idx}.${compIdx}`];
        return value || '';
      });
      args.push(tupleValue);
      types.push(input.type);
    } else {
      args.push(formState[idx]);
      types.push(input.type);
    }
  });

  return { args, types };
};

const useFormData = (fn, formState) => {
  if (!fn) {
    return { args: [], types: [], flattenedInputs: [] };
  }

  const inputs = fn.inputs || [];
  const flattenedInputs = flattenInputs(inputs);
  const { args, types } = reconstructTupleArgs(inputs, formState);

  return { args, types, flattenedInputs };
};

export default useFormData;
