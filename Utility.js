//Static Utility Variables
readline = null;
rl = null;

class Utility {
  static CreateFunction(owner, func) {
    return function() { return func.apply(owner, arguments) };
  }

  static InitializeConsoleReader() {
    if (Utility.IsRunningInWebpage() === false) {
      readline = require('readline');

      rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout
      });
    }
  }

  static IsRunningInWebpage() {
    return !(typeof window === 'undefined');
  }
}