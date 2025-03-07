import React, { ComponentType, ReactElement } from 'react';
import {
  render,
  renderHook,
  RenderHookOptions,
  RenderHookResult,
  RenderOptions,
  RenderResult,
} from '@testing-library/react';
import { CoreProvider, gen3Api, useCoreDispatch } from '@gen3/core';


const ResetCoreProvider = () => {
  const dispatch = useCoreDispatch();
  dispatch(gen3Api.util.resetApiState());
  return null;
};

/**
 * AllTheProviders is a React functional component designed to wrap its children
 * components with a CoreProvider. This ensures that the children have access to
 * the context or functionality provided by CoreProvider.
 *
 * @type {React.FC<{ children: React.ReactNode }>}
 * @param {object} props - Component properties.
 * @param {React.ReactNode} props.children - Any valid React node(s) or component(s)
 *        that will be wrapped by the CoreProvider.
 *
 *       TODO: Add additional providers
 */
const AllTheProviders: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  return <CoreProvider><ResetCoreProvider />{children}</CoreProvider>;
};

const customRender = (
  ui: ReactElement,
  options?: Omit<RenderOptions, 'wrapper'>,
): RenderResult =>
  render(ui, { wrapper: AllTheProviders as ComponentType, ...options });

// Custom renderHook wrapper
const customRenderHook = <Result, Props>(
  render: (props: Props) => Result,
  options?: RenderHookOptions<Props>,
): RenderHookResult<Result, Props> => {
  return renderHook(render, {
    wrapper: AllTheProviders as ComponentType,
    ...options,
  });
};

export * from '@testing-library/react';
export { customRender as render, customRenderHook as renderHook };
