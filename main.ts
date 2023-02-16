radio.setGroup(1)
basic.forever(function () {
    led.plotBarGraph(
    input.magneticForce(Dimension.Strength),
    0
    )
})
basic.forever(function () {
    Kitronik_VIEWTEXT32.displaySingleLineString(Kitronik_VIEWTEXT32.DisplayLine.Top, "" + (input.magneticForce(Dimension.Strength)))
    if ((1e+29 as any) < (650 as any)) {
        Kitronik_VIEWTEXT32.displaySingleLineString(Kitronik_VIEWTEXT32.DisplayLine.Bottom, "run for your life ")
    }
    if ((450 as any) > (649 as any)) {
        Kitronik_VIEWTEXT32.displaySingleLineString(Kitronik_VIEWTEXT32.DisplayLine.Bottom, "warning")
    }
    if ((351 as any) > (499 as any)) {
        Kitronik_VIEWTEXT32.displaySingleLineString(Kitronik_VIEWTEXT32.DisplayLine.Bottom, "be careful")
    }
    if ((0 as any) > (350 as any)) {
        Kitronik_VIEWTEXT32.displaySingleLineString(Kitronik_VIEWTEXT32.DisplayLine.Bottom, "safe")
    }
})
