export const idlFactory = ({ IDL }) => {
  const LayoutItem = IDL.Record({
    'top' : IDL.Text,
    'content' : IDL.Text,
    'left' : IDL.Text,
    'type' : IDL.Text,
  });
  const Result = IDL.Variant({ 'ok' : IDL.Text, 'err' : IDL.Text });
  return IDL.Service({
    'loadLayout' : IDL.Func([], [IDL.Vec(LayoutItem)], ['query']),
    'saveLayout' : IDL.Func([IDL.Vec(LayoutItem)], [Result], []),
  });
};
export const init = ({ IDL }) => { return []; };
