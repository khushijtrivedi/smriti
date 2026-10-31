Pattern
  = __ head:Round tail:(Nl r:Round { return r; })* __ { return [head, ...tail]; }

Round
  = RoundLabel n:Integer _ ":" _ items:ItemList _ count:Count? _ {
      return { number: n, items, count: count ?? null, line: location().start.line };
    }

RoundLabel = ("Round"i / "Rnd"i / "R"i) _

ItemList
  = head:Item tail:(_ "," _ i:Item { return i; })* { return [head, ...tail]; }

Item = Repeat / Stitches

Repeat
  = "[" _ items:ItemList _ "]" _ "x"i _ times:Integer {
      return { kind: 'repeat', items, times };
    }

Stitches
  = n:(v:Integer _ { return v; })? stitch:Stitch _ place:Place? times:(_ "x"i _ t:Integer { return t; })? {
      return { kind: 'stitch', stitch, count: (n ?? 1) * (times ?? 1), place: place ?? null };
    }

Stitch
  = ("sl st"i / "slst"i) { return 'slst'; }
  / "hdc"i { return 'hdc'; }
  / "sc"i  { return 'sc'; }
  / "dc"i  { return 'dc'; }
  / "inc"i { return 'inc'; }
  / "dec"i { return 'dec'; }
  / "ch"i  { return 'ch'; }

Place
  = "in"i _ ("magic ring"i / "mr"i) _ { return 'magic-ring'; }
  / "in"i _ ("each st"i / "each stitch"i) _ { return 'each'; }

Count = "(" _ n:Integer _ ")" { return n; }

Integer = d:$[0-9]+ { return parseInt(d, 10); }

_  = [ \t]*
__ = [ \t\r\n]*
Nl = ([ \t]* [\r\n])+ [ \t]*