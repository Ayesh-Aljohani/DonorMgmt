using { DonorMgmt as my } from '../db/schema.cds';

@path: '/service/donorMgmt'
@requires: 'authenticated-user'
service donorMgmtSrv {
  @odata.draft.enabled
  entity Donors as projection on my.Donors;
  @odata.draft.enabled
  entity Donations as projection on my.Donations;
}