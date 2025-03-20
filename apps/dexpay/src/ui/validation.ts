/* eslint-disable @typescript-eslint/no-namespace */
/* eslint-disable no-useless-escape */
import { validateMnemonic } from 'bip39';
import dayjs from 'dayjs';
import { object, string, ref, number, date, boolean, array, mixed } from 'yup';

export namespace Validation {
  export namespace Crypto {
    export const seedPhrase = array()
      .min(12, 'Seed phrase must have at least 12 words')
      .of(string().required('Each word is required'))
      .test(
        'valid-seed-phrase',
        'Invalid seed phrase',
        (value: string[] | undefined) => {
          if (!value) {
            return false;
          } // Handle undefined/null values
          const seedPhraseString = value.join(' ');
          return validateMnemonic(seedPhraseString);
        },
      );
  }
  export namespace Auth {
    export const invation = object({
      newPassword: string()
        .required('Password is a required field')
        .min(8, (ctx) => `Password must be at least ${ctx.min} characters`)
        .max(20, (ctx) => `Password must be at most ${ctx.max} characters`)
        .matches(
          /^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#\$%\^&\*\(\)_\+\-=\[\]\{\};:'",<>\.\?\/\\|`~])/,
          'Must Contain One Uppercase, One Lowercase, One Number and One Special Case Character',
        ),
      confirmNewPassword: string()
        .required('Confirm password is a required field')
        .min(
          8,
          (ctx) => `Confirm password must be at least ${ctx.min} characters`,
        )
        .max(
          20,
          (ctx) => `Confirm password must be at most ${ctx.max} characters`,
        )
        .oneOf([ref('newPassword')], 'Password mismatch'),
    });
    export const signUp = object({
      email: string()
        .required('Email is a required field')
        .email('Wrong email'),
      password: string()
        .required('Password is a required field')
        .min(8, (ctx) => `Password must be at least ${ctx.min} characters`)
        .max(20, (ctx) => `Password must be at most ${ctx.max} characters`)
        .matches(
          /^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#\$%\^&\*\(\)_\+\-=\[\]\{\};:'",<>\.\?\/\\|`~])/,
          'Must Contain One Uppercase, One Lowercase, One Number and One Special Case Character',
        ),
      confirmPassword: string()
        .required('Confirm password is a required field')
        .min(
          8,
          (ctx) => `Confirm password must be at least ${ctx.min} characters`,
        )
        .max(
          20,
          (ctx) => `Confirm password must be at most ${ctx.max} characters`,
        )
        .oneOf([ref('password')], 'Password mismatch'),
      first_name: string().required('First name is a required field'),
      last_name: string().required('Last name is a required field'),
    });

    export const signIn = object({
      email: string()
        .required('Email is a required field')
        .email('Wrong email'),
      password: string()
        .required('Password is a required field')
        .min(8, (ctx) => `Password must be at least ${ctx.min} characters`)
        .max(20, (ctx) => `Password must be at most ${ctx.max} characters`),
    });

    export const forgotPassword = object({
      email: string()
        .required('Email is a required field')
        .email('Wrong email'),
      new_password: string()
        .required('New password is a required field')
        .min(8, (ctx) => `New password must be at least ${ctx.min} characters`)
        .max(20, (ctx) => `New password must be at least ${ctx.max} characters`)
        .matches(
          /^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#\$%\^&\*])(?=.{8,})/,
          'Must Contain One Uppercase, One Lowercase, One Number and One Special Case Character',
        ),
      confirm_password: string()
        .required('Confirm password is a required field')
        .min(
          8,
          (ctx) => `Confirm password must be at least ${ctx.min} characters`,
        )
        .max(
          20,
          (ctx) => `Confirm password must be at most ${ctx.max} characters`,
        )
        .oneOf([ref('new_password')], 'Password mismatch'),
    });
  }

  export namespace ApiToken {
    export const request = object({
      api_token_name: string().required('Name is a required field'),
    });
  }

  export namespace Project {
    export const create = object({
      name: string()
        .required()
        .test(
          'no-dexpay',
          'Project name cannot contain the word "Dexpay"',
          (value) => !/dexpay/i.test(value || ''),
        ),
      username: string().required(),
      mnemonic_encrypted_id: number().required('Mnemonic is a required field'),
    });

    export const update = object({
      name: string()
        .required()
        .test(
          'no-dexpay',
          'Project name cannot contain the word "Dexpay"',
          (value) => !/dexpay/i.test(value || ''),
        ),
      username: string(),
    });
  }

  export namespace Vault {
    export const create = object({
      user_external_id: string(),
      name: string().required('Name is a required field'),
      mnemonic_encrypted_id: number().required('Mnemonic is a required field'),
    });
  }

  export namespace Address {
    export const create = object({
      currency: object({
        id: number().required(),
        network: object({
          public_name: string().required(),
        }),
      }).required(),
    });

    export const createWithVault = object({
      vault_id: number().required(),
    });
  }

  export namespace Memo {
    export const beginImport = object({
      name: string().required(),
      memo: string().required(),
    }).required();
  }

  export namespace Callback {
    export const create = object({
      name: string().required(),
      url: string().url().required(),
    }).required();
  }

  export namespace Invoice {
    export const create = object({
      primaryCoin: object().shape({
        amount: string().required(),
        coin: string().required('Coin is required'), // Assuming coin is required within primaryCoin
      }),
      convertedCurrencies: array().min(
        1,
        'At least one converted currency is required',
      ),
      description: string(),
      dueDate: mixed()
        .nullable()
        .test('is-valid-date', 'Invalid due date', (value) => {
          if (value === null) {
            return true;
          } // Allow null values
          return dayjs(value).isValid(); // Check if it's a valid dayjs date
        }),
    });

    export const createCashier = object({
      amount_requested: string().required('Amount'),
      coin_id: string().required('Invoice currency'),
      currency_id: string().required('Payment currency is required'),
    });

    export const update = object({
      description: string().max(
        250,
        (ctx) => `Description must be at most ${ctx.max} characters`,
      ),
      amount_requested: number().required('Amount is required'),
      due_to: date(),
      status: boolean(),
    });
  }

  export namespace Pair {
    export const create = object({
      isUserMissing: boolean(),
      name: string(),
      currency_main_id: string().required('Main Currency is required'),
      currency_second_id: string().required('Secondary Currency is required'),
      liquidity_address_main_id: string(),
      liquidity_address_second_id: string(),
      service_params_main: string().required('Field is required'),
      service_params_second: string().required('Field is required'),

      minimumExchangeAmountCoin1: number().required(
        'Minimum Exchange Amount is required',
      ),
      maximumExchangeAmountCoin1: number().required(
        'Maximum Exchange Amount is required',
      ),
      priceAdjustment: number().required('Price is required'),
      transactionFee: string(),
      exchangersPolicy: string(),
      username: string().when('isUserMissing', {
        is: true,
        then: (schema) => schema.required('DexTrade Username is required'),
        otherwise: (schema) => schema.nullable(),
      }),
    });

    export const update = object({
      name: string(),
      currency_main_id: string(),
      currency_second_id: string(),
      liquidity_address_main_id: string(),
      liquidity_address_second_id: string(),
      service_params_main: string().required('Field is required'),
      service_params_second: string().required('Field is required'),
      is_active: boolean(),
    });
  }

  export namespace DexTrade {
    export namespace User {
      export const create = object({
        username: string().required(),
      });
    }
    export namespace Advert {
      export const create = object({
        priceSourceProvider: object().required(),
        coin1: object().required(),
        coin2: object().required(),
        minimumExchangeAmountCoin1: string().required(
          'Minimum Exchange Amount is required',
        ),
        maximumExchangeAmountCoin1: string().optional().nullable(),
        priceAdjustment: string(),
        transactionFee: string(),
        exchangersPolicy: string(),
        username: string(),
      });

      export const update = object({
        minimumExchangeAmountCoin1: number().required(
          'Minimum Exchange Amount is required',
        ),
        maximumExchangeAmountCoin1: number().required(
          'Maximum Exchange Amount is required',
        ),
        priceAdjustment: number().required('Price is required'),
        transactionFee: string(),
        exchangersPolicy: string(),
        username: string(),
      });
    }
  }

  export namespace Withdrawal {
    export const create = object({
      currency_id: number().required('Currency is required'),
      address_from_id: number().required('Address From is required'),
      // address_to_id: number().required('Address To is required'),
      address_to: string().required('Address To is required'),
      amount: number().required('Amount is required'),
    });
  }

  export namespace TwoFA {
    export const enable2FA = object({
      google2FACode: number().required('Code is required'),
    });
  }
}
