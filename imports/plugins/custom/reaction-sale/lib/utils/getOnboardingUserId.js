export default async function getOnboardingUserId(collections) {
  const { Accounts } = collections;

  const onboardingAccount = await Accounts.findOne(
    { username: "onboarding" },
    { fields: { userId: 1 } }
  );

  const { userId } = onboardingAccount || {};

  return userId;
}
