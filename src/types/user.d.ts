export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phone: string;
  address: string;
  userType: 'bidder' | 'auctioneer' | 'admin' | 'support';
  verificado: boolean;
}
