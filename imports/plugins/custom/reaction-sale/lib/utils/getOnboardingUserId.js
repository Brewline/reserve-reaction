export default async function getOnboardingUserId(collections) {
  const { Accounts } = collections;

  const onboardingAccount =
    await Accounts.findOne({ username: "onboarding" }, { fields: { _id: 1 } });

  const { _id } = onboardingAccount || {};

  return _id;
}
