// Pretend it is hitting the network
export async function waait() {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve();
    }, 3000);
  });
}

// Add a delay for a certain time in milliseconds
export async function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
