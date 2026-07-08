import 'react-native-gesture-handler'
import Navigation from './src/Navigation'
import { useNotifications } from './src/hooks/useNotifications'

function AppWithNotifications() {
  useNotifications()
  return <Navigation />
}

export default function App() {
  return <AppWithNotifications />
}
