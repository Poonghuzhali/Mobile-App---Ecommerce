import { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import { CompositeScreenProps, useFocusEffect } from '@react-navigation/native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { CommonActions } from '@react-navigation/native';
import { useCallback } from 'react';
import { LoadingView } from '../../components/ui/StateViews';
import { navigationRef } from '../../navigation/navigationRef';
import { RootStackParamList, TabParamList } from '../../navigation/types';

type Props = CompositeScreenProps<
  BottomTabScreenProps<TabParamList, 'Shop'>,
  NativeStackScreenProps<RootStackParamList>
>;

export function ShopScreen(_props: Props) {
  useFocusEffect(
    useCallback(() => {
      if (!navigationRef.isReady()) return;
      navigationRef.dispatch(
        CommonActions.navigate({
          name: 'ProductList',
          params: { title: 'All products' },
        }),
      );
    }, []),
  );

  return <LoadingView message="Opening shop…" />;
}
