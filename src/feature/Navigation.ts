export function navigateToPath(path: string, query: any) {
  console.log('navigateToPath', path, query);
  const grt = (window as any).grafanaRuntime;
  if (grt) {
    grt.store.dispatch(grt.updateLocation({path, query}));
  } else {
    alert('TODO, navigate: ' + path);
  }
}
