import ACTIONS from '../../Utils/StateManagement/Actions';

export type ModelParamValues = {
    [key: string]: any;
};

export class ModelParametersUtils {
    private modelParameters?: Record<string, any>;
    private initialModelParameters: Record<string, any>;
    private dispatch: (action: any) => void;
    private model: string;

    constructor(
        initialModelParameters: Record<string, any>,
        dispatch: (action: any) => void,
        model: string,
        modelParameters?: Record<string, any>,
    ) {
        this.modelParameters = modelParameters;
        this.initialModelParameters = initialModelParameters;
        this.dispatch = dispatch;
        this.model = model;
    }

    handleSetModelParameters = (
        key: string,
        value: any
    ) => {
        const original = this.getValue(key);
        // If the original is an array and the input value is a string (assume CSV), split to array:
        if (Array.isArray(original) && typeof value === "string") {
            // Optionally trim whitespace and filter empty strings:
            const parsed = value
                .split(',')
                .map(item => item.trim())
                .filter(item => item.length > 0);

            value = parsed;

            // if original items were numbers, convert all new ones to numbers:
            const allNumbers = original.every(item => typeof item === 'number' && !isNaN(item));
            if (allNumbers) {
                const numbers: number[] = parsed.map(num => Number(num));
                value = numbers;
            }
        }
        // mapping for MultiSelect scenario where numbers and strings can be mixed:
        if (Array.isArray(value)) {
            value = value.map(v => isNaN(Number(v)) ? v : Number(v));
        }

        this.dispatch({
            type: ACTIONS.SET_SELECTED_MODEL_PARAMETERS,
            payload: {
                [this.model]: {
                    ...(this.modelParameters?.[this.model]
                        ? this.modelParameters[this.model]
                        : this.initialModelParameters[this.model]
                    ),
                    [key]: value,
                }
            },
        });
    };

    getValue = (fieldName: string) => {
        return this.modelParameters?.[this.model]
            ? this.modelParameters[this.model][fieldName]
            : this.initialModelParameters[this.model][fieldName];
    };
}
