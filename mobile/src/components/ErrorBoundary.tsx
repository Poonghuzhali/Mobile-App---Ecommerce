import { Component, ErrorInfo, ReactNode } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { Button } from './ui/Button';
import { colors, scrollIndicatorHidden, spacing } from '../theme';

type Props = { children: ReactNode };
type State = { error: Error | null };

export class ErrorBoundary extends Component<Props, State> {
  state: State = { error: null };

  static getDerivedStateFromError(error: Error) {
    return { error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('App crash:', error, info.componentStack);
  }

  render() {
    if (this.state.error) {
      return (
        <View style={styles.wrap}>
          <Text style={styles.title}>Something went wrong</Text>
          <ScrollView {...scrollIndicatorHidden} style={styles.box}>
            <Text style={styles.msg}>{this.state.error.message}</Text>
          </ScrollView>
          <Button title="Try again" onPress={() => this.setState({ error: null })} />
        </View>
      );
    }
    return this.props.children;
  }
}

const styles = StyleSheet.create({
  wrap: { flex: 1, backgroundColor: colors.bg, padding: spacing.lg, justifyContent: 'center', gap: spacing.md },
  title: { fontSize: 20, fontWeight: '600', color: colors.text },
  box: { maxHeight: 200, backgroundColor: colors.surface, padding: spacing.md, borderRadius: 8 },
  msg: { color: colors.error, fontFamily: 'monospace', fontSize: 12 },
});
