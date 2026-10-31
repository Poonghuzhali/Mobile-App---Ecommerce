import { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import { CompositeScreenProps, useFocusEffect } from '@react-navigation/native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useCallback } from 'react';
import { LoadingView } from '../../components/ui/StateViews';
import { RootStackParamList, TabParamList } from '../../navigation/types';

type Props = CompositeScreenProps<
  BottomTabScreenProps<TabParamList, 'Shop'>,
  NativeStackScreenProps<RootStackParamList>
>;

export function ShopScreen({ navigation }: Props) {
  useFocusEffect(
    useCallback(() => {
      navigation.getParent()?.navigate('ProductList', { title: 'All products' });
    }, [navigation]),
  );

  return <LoadingView message="Opening shop…" />;
}
