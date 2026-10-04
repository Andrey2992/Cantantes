import { DomainError } from '../errors/DomainError.js';
import { ProjectTheme } from './ProjectTheme.js';

describe('ProjectTheme', () => {
  it('normalizes hex colors to lowercase with a leading hash', () => {
    const theme = ProjectTheme.of({
      from: '73A9AD',
      to: '#EEF5F5',
      accent: '00d2ff',
    });

    expect(theme.from).toBe('#73a9ad');
    expect(theme.to).toBe('#eef5f5');
    expect(theme.accent).toBe('#00d2ff');
  });

  it('rejects malformed colors before they reach the renderer', () => {
    expect(() =>
      ProjectTheme.of({ from: '#fff', to: '#eef5f5', accent: '#00d2ff' }),
    ).toThrow(DomainError);
    expect(() =>
      ProjectTheme.of({ from: '#73a9ad', to: 'rgb(1,2,3)', accent: '#00d2ff' }),
    ).toThrow(DomainError);
    expect(() =>
      ProjectTheme.of({ from: '#73a9ad', to: '#eef5f5', accent: '' }),
    ).toThrow(DomainError);
  });

  it('names the offending field in the error message', () => {
    expect(() =>
      ProjectTheme.of({ from: '#73a9ad', to: '#eef5f5', accent: 'nope' }),
    ).toThrow(/accent/);
  });

  it('rejects identical gradient stops because the cross-fade would be a no-op', () => {
    expect(() =>
      ProjectTheme.of({ from: '#73A9AD', to: '#73a9ad', accent: '#00d2ff' }),
    ).toThrow(DomainError);
  });

  it('compares by value', () => {
    const theme = ProjectTheme.of({
      from: '#09203f',
      to: '#00d2ff',
      accent: '#00d2ff',
    });
    const same = ProjectTheme.of({
      from: '#09203f',
      to: '#00d2ff',
      accent: '#00d2ff',
    });
    const other = ProjectTheme.of({
      from: '#1f140e',
      to: '#5a3c22',
      accent: '#c9a227',
    });

    expect(theme.equals(same)).toBe(true);
    expect(theme.equals(other)).toBe(false);
  });
});
