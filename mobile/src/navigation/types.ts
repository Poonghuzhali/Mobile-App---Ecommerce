export type RootStackParamList = {
  MainTabs:
    | { screen?: keyof TabParamList | keyof AdminTabParamList }
    | undefined;
  ProductDetail: { productId: number };
  ProductList: { categoryId?: number; title?: string };
  Search: undefined;
  Checkout: { selectedAddressId?: number } | undefined;
  OrderDetail: { orderId: number; paymentSuccess?: boolean };
  AddressForm: { addressId?: number; fromCheckout?: boolean };
  Login: undefined;
  Register: undefined;
  ForgotPassword: undefined;
  ResetPassword: { token?: string };
  Notifications: undefined;
  Addresses: { selectForCheckout?: boolean } | undefined;
  AdminOrderManage: { orderId: number };
};

export type TabParamList = {
  Home: undefined;
  Shop: undefined;
  Wishlist: undefined;
  Cart: undefined;
  Profile: undefined;
};

export type AdminTabParamList = {
  AdminDashboard: undefined;
  AdminOrders: undefined;
  AdminInventory: undefined;
  AdminCustomers: undefined;
  AdminAccount: undefined;
};
