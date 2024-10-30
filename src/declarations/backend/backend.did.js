export const idlFactory = ({ IDL }) => {
  const LayoutItem = IDL.Record({
    'top' : IDL.Text,
    'height' : IDL.Text,
    'styles' : IDL.Record({
      'backgroundColor' : IDL.Text,
      'borderRadius' : IDL.Text,
      'borderStyle' : IDL.Text,
      'color' : IDL.Text,
      'borderWidth' : IDL.Text,
      'boxShadow' : IDL.Text,
      'fontSize' : IDL.Text,
      'borderColor' : IDL.Text,
    }),
    'content' : IDL.Text,
    'left' : IDL.Text,
    'type' : IDL.Text,
    'width' : IDL.Text,
  });
  const Result = IDL.Variant({ 'ok' : IDL.Text, 'err' : IDL.Text });
  return IDL.Service({
    'loadLayout' : IDL.Func([], [IDL.Vec(LayoutItem)], ['query']),
    'saveLayout' : IDL.Func([IDL.Vec(LayoutItem)], [Result], []),
  });
};
export const init = ({ IDL }) => { return []; };
