function Button() {
  const name = "luka";
  return <button>This is a button {name}</button>;
}

let buttonOutput: any = null;
function startRender() {
  const output = Button();
  if (buttonOutput === null) {
    buttonOutput = output;
    return;
  }
  if (buttonOutput !== output) {
    startRender();
  }
}
startRender();
