import { hasProperty, isNumber, isObject, isString, isURL } from '@tt/utils';

export class ParserBase {
  static errors: string[] = [];
  static guids: string[] = [];

  static get isErrored(): boolean {
    return this.errors.length > 0;
  }

  static get guid(): string | undefined {
    return this.guids.at(-1);
  }

  static reset(): void {
    this.errors = [];
    this.guids = [];
  }

  static assert(condition: boolean, message?: string): boolean {
    if (!condition) {
      if (message) this.errors.push(message);
      return false;
    }
    return true;
  }

  static hasProperty<T extends object, K extends string>(
    obj: T,
    name: K,
    message?: string,
  ): obj is T & { [P in K]: unknown } {
    return this.assert(hasProperty(obj, name), message);
  }

  static hasPropertyString<T extends object, K extends string>(obj: T, name: K): obj is T & { [P in K]: string } {
    return hasProperty(obj, name) && isString(obj[name]);
  }

  static hasPropertyURL<T extends object, K extends string>(obj: T, name: K): obj is T & { [P in K]: string } {
    return this.hasPropertyString(obj, name) && isURL(obj[name]);
  }

  static isString(obj: unknown, message?: string): obj is string {
    return this.assert(isString(obj), message);
  }

  static isArray(obj: unknown, message?: string): obj is unknown[] {
    return this.assert(Array.isArray(obj), message);
  }

  static isObject(obj: unknown, message?: string): obj is object {
    return this.assert(isObject(obj), message);
  }

  static isPropertyString<T extends object, K extends keyof T>(
    obj: T,
    name: K,
    message?: string,
  ): obj is T & { [P in K]: string } {
    return this.assert(isString(obj[name]), message);
  }

  static isURL(urlString: string, message?: string): boolean {
    return this.assert(isURL(urlString), message);
  }

  static parseNumber(value: unknown): number | null {
    if (isNumber(value)) return value;
    if (isString(value)) {
      const candidate = parseInt(value);
      if (!isNaN(candidate)) return candidate;
    }
    return null;
  }

  static get errorsText() {
    return {
      ERROR: 'Error',
      TALBE: {
        NO_TYPE_PROPERTY: 'Table has no type property',
        TYPE_PROPERTY_NOT_STRING: 'Table type property is not a string',
        TABLE_URL_NOT_STRING: 'Table url is not a string',
        TABLE_URL_INVALID: 'Table url is not a valid URL',
      },
      MODEL: {
        NO_PROPERTY: `Actor ${this.guid} no custom mesh property`,
        NOT_OBJECT: `Actor ${this.guid} model is not an object`,
        MESH: {
          NO_URL: `Actor ${this.guid} model has no mesh url`,
          URL_NOT_STRING: `Actor ${this.guid} model mesh url is not a string`,
          URL_INVALID: `Actor ${this.guid} model mesh url is not a valid URL`,
        },
        COLLDER: {
          URL_NOT_STRING: `Actor ${this.guid} model collider url is not a string`,
          URL_INVALID: `Actor ${this.guid} model collider url is not a valid URL`,
        },
        DIFFUSE: {
          URL_NOT_STRING: `Actor ${this.guid} model diffuse url is not a string`,
          URL_INVALID: `Actor ${this.guid} model diffuse url is not a valid URL`,
        },
        NORMAL: {
          URL_NOT_STRING: `Actor ${this.guid} model normal url is not a string`,
          URL_INVALID: `Actor ${this.guid} model normal url is not a valid URL`,
        },
      },
      TRANSFORM: {
        NO_POS_X: `Actor ${this.guid} transform has no position x`,
        NO_POS_Y: `Actor ${this.guid} transform has no position y`,
        NO_POS_Z: `Actor ${this.guid} transform has no position z`,
        NO_ROT_X: `Actor ${this.guid} transform has no rotation x`,
        NO_ROT_Y: `Actor ${this.guid} transform has no rotation y`,
        NO_ROT_Z: `Actor ${this.guid} transform has no rotation z`,
        NO_SCALE_X: `Actor ${this.guid} transform has no scale x`,
        NO_SCALE_Y: `Actor ${this.guid} transform has no scale y`,
        NO_SCALE_Z: `Actor ${this.guid} transform has no scale z`,
      },
      CUSTOM_IMAGE: {
        IMAGE_URL: {
          NO_PROPERTY: `Actor ${this.guid} has no custom image url property`,
          NOT_STRING: `Actor ${this.guid} custom image url is not a string`,
          INVALID: `Actor ${this.guid} custom image url is not a valid URL`,
        },
        SECONDARY_URL: {
          NOT_STRING: `Actor ${this.guid} custom image secondary url is not a string`,
          INVALID: `Actor ${this.guid} custom image secondary url is not a valid URL`,
        },
      },
      ACTOR: {
        STATE_NOT_OBJECT: 'Actor state is not an object',
        NO_GUID_PROPERTY: 'Actor has no guid property',
        GUID_PROPERTY_NOT_STRING: 'Actor guid property is not a string',
        NO_NAME_PROPERTY: 'Actor has no name property',
        NAME_PROPERTY_NOT_STRING: 'Actor name property is not a string',
        NO_TRANSFORM_PROPERTY: 'Actor has no transform property',
        CUSTOM_MESH: {
          NO_PROPERTY: `Actor ${this.guid} has no custom mesh property`,
          NOT_OBJECT: `Actor ${this.guid} custom mesh is not an object`,
        },
      },
      TILE: {
        CUSTOM_IMAGE: {
          NO_PROPERTY: `Tile ${this.guid} has no custom image property`,
          NOT_OBJECT: `Tile ${this.guid} custom image is not an object`,
        },
      },
    };
  }
}
