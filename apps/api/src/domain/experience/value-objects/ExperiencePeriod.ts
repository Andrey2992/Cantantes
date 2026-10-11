import { DomainError } from '../../shared/errors/DomainError.js';

/**
 * EN: Raw shape accepted from callers and from the persistence mapper.
 *
 * ES: Forma cruda aceptada por los llamadores y por el mapeador de persistencia.
 */
export type ExperiencePeriodProps = {
  readonly start: Date;
  /** EN: `null` while the role is ongoing. / ES: `null` mientras el cargo está vigente. */
  readonly end: Date | null;
};

/**
 * EN: The time span of a professional experience record.
 *
 * It exists because the start/end pair carries a real invariant that a pair of
 * loose `Date` fields would not: an end date may not precede the start date. It
 * also models "current role" explicitly (`end === null`) instead of using a
 * sentinel far-future date.
 *
 * Defensive copies are taken on the way in and on the way out so a caller cannot
 * mutate the period through the `Date` objects it handed over.
 *
 * ES: El intervalo temporal de un registro de experiencia profesional.
 *
 * Existe porque el par inicio/fin conlleva una invariante real que un par de
 * campos `Date` sueltos no tendría: una fecha de fin no puede ser anterior a la
 * de inicio. También modela explícitamente el "cargo actual" (`end === null`) en
 * lugar de usar una fecha centinela en el futuro lejano.
 *
 * Se hacen copias defensivas a la entrada y a la salida para que un llamador no
 * pueda mutar el período a través de los objetos `Date` que entregó.
 */
export class ExperiencePeriod {
  private readonly startDate: Date;
  private readonly endDate: Date | null;

  private constructor(start: Date, end: Date | null) {
    this.startDate = new Date(start.getTime());
    this.endDate = end === null ? null : new Date(end.getTime());
  }

  /**
   * EN: Validates a period.
   * @param props Start date and optional end date, see {@link ExperiencePeriodProps}.
   * @returns A `ExperiencePeriod` holding defensive copies.
   * @throws {DomainError} If a value is not a valid `Date`, or if the end is
   * earlier than the start.
   *
   * ES: Valida un período.
   * @param props Fecha de inicio y fecha de fin opcional, ver {@link ExperiencePeriodProps}.
   * @returns Un `ExperiencePeriod` con copias defensivas.
   * @throws {DomainError} Si un valor no es un `Date` válido, o si el fin es
   * anterior al inicio.
   */
  static of(props: ExperiencePeriodProps): ExperiencePeriod {
    const start = toValidDate(props.start, 'ExperiencePeriod start');

    if (props.end === null) {
      return new ExperiencePeriod(start, null);
    }

    const end = toValidDate(props.end, 'ExperiencePeriod end');

    if (end.getTime() < start.getTime()) {
      throw new DomainError(
        'ExperiencePeriod end must not be earlier than start',
      );
    }

    return new ExperiencePeriod(start, end);
  }

  /** EN: Start date (defensive copy). / ES: Fecha de inicio (copia defensiva). */
  get start(): Date {
    return new Date(this.startDate.getTime());
  }

  /** EN: End date, or `null` while ongoing. / ES: Fecha de fin, o `null` si está vigente. */
  get end(): Date | null {
    return this.endDate === null ? null : new Date(this.endDate.getTime());
  }

  /** EN: `true` when the role has no end date yet. / ES: `true` cuando el cargo aún no tiene fecha de fin. */
  get isOngoing(): boolean {
    return this.endDate === null;
  }

  /** EN: Value equality over both instants. / ES: Igualdad por valor sobre ambos instantes. */
  equals(other: ExperiencePeriod): boolean {
    const sameStart = this.startDate.getTime() === other.startDate.getTime();

    if (!sameStart) {
      return false;
    }

    if (this.endDate === null || other.endDate === null) {
      return this.endDate === other.endDate;
    }

    return this.endDate.getTime() === other.endDate.getTime();
  }
}

/**
 * EN: Guards a value that must be a valid `Date`. A `Date` built from an invalid
 * string is still an object, so `instanceof` alone is not enough.
 *
 * ES: Protege un valor que debe ser un `Date` válido. Un `Date` construido desde
 * una cadena inválida sigue siendo un objeto, así que `instanceof` por sí solo no
 * basta.
 */
function toValidDate(raw: Date, field: string): Date {
  if (!(raw instanceof Date) || Number.isNaN(raw.getTime())) {
    throw new DomainError(`${field} must be a valid Date`);
  }

  return raw;
}
