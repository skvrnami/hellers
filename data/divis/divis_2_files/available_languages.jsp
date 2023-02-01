










AUI.add(
	'portal-available-languages',
	function(A) {
		var available = {};

		var direction = {};

		

			available['en_GB'] = 'English (United Kingdom)';
			direction['en_GB'] = 'ltr';

		

			available['cs_CZ'] = 'čeština (Česká republika)';
			direction['cs_CZ'] = 'ltr';

		

		Liferay.Language.available = available;
		Liferay.Language.direction = direction;
	},
	'',
	{
		requires: ['liferay-language']
	}
);