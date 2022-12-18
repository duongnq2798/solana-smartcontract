export const wrapEventListener = async (
  program: any,
  name: string,
  callback: Function
): Promise<[any, any]> => {
  var listener = null;
  let [event, slot] = await new Promise((resolve, _reject) => {
    listener = program.addEventListener(name, (event, slot) => {
      resolve([event, slot]);
    })(async () => {
      await callback();
    })();
  });
  await unwrapEventListener(program, listener);
  return [event, listener];
};

export const unwrapEventListener = async (
  program: any,
  listener: any
): Promise<boolean> => {
  try {
    await program.removeEventListener(listener);
    return true;
  } catch (error) {
    return false;
  }
};
