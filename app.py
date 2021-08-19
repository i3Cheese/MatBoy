from server import app


def module_context(module):
    context = {}
    for name in dir(module):
        if not name.startswith('_'):
            context[name] = getattr(module, name)
    return context


@app.shell_context_processor
def make_shell_context():
    import data
    context = module_context(data)
    return context


if __name__ == "__main__":
    app.run(debug=True)
