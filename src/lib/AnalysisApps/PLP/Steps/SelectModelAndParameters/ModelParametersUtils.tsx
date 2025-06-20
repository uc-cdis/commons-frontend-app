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
