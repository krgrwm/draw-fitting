
export interface realFunc
{
  (x: number): number
}

let f: realFunc
f = function(x)
{
  return 4 / (1+x*x)
}

export function integrate(f: realFunc, N: number, a: number, b: number)
{
  let width = b - a
  let h = width / N
  let sum = 0
  for (var i=1; i<N; i++)
  {
    sum += f(a + i * h)
  }
  sum *= 2
  sum += f(a) + f(b)
  sum *= 0.5*h
  return sum
}

export class OrthogonalFunctions
{
  static combination(n: number, r: number) {
    if (2*(n-r) > n)
    {
      return this.combination(n, n-r)
    }

    let num = 1;
    for (var i = 1; i <= r; i++) {
      num = num * (n - i + 1) / i;
    }
    return num;
  }

  public static legendrePolynomial(n, x)
  {
    if (n==0)
    {
      return 1
    } else if (n==1)
    {
      return x
    }
    let sum = 0
    for (var k=0; k<=n; k++)
    {
      let t = Math.pow(x, k) * this.combination(n, k) * this.combination((n+k-1)/2, n)
      sum += Math.pow(x, k) * this.combination(n, k) * this.combination((n+k-1)/2, n)
    }
    sum *= Math.pow(2, n)
    return sum
  }
}

function memoize(f)
{
  let memo: {[key: number]: realFunc} = {}
  let memoized = function(n): realFunc
  {
    if (memo[n])
    {
      return memo[n]
    } else {
      let res = f(n)
      console.log("cache not found: " + n)
      console.log(res)
      memo[n] = res;
      return res;
    }
  }
  return memoized
}

export let legendrePolynomial = memoize(_legendrePolynomial)

function _legendrePolynomial(n: number): realFunc
{
  if (n==0)
  {
    return function(x) {return 1}
  }
  else if (n==1)
  {
    return function(x) {return x}
  }

  return function(x)
  {
    return (2*n-1)/n * x * legendrePolynomial(n-1)(x) - (n-1) / n * legendrePolynomial(n-2)(x)
  }
}

export function calcLegendrePolynomalCoeff(f: realFunc, degree: number, N: number)
{
  let ar = new Array(degree)
  for (var i=0; i<=degree; i++)
  {
    //ar[i] = integrate(function (x) { return legendrePolynomial(i)(x) * f(x) }, N, -1, 1)
    ar[i] = integrate(function (x) { return OrthogonalFunctions.legendrePolynomial(i, x) * f(x) }, N, -1, 1)
    //ar[i] = integrate(function (x) { return Math.sin(x) * f(x) }, N, -1, 1)
    //ar[i] = integrate(Math.sin, 1, -1, 1)
    ar[i] = ar[i] * (2.0 * i + 1) / 2.0
  }
  return ar
}