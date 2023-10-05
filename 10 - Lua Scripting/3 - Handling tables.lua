local user = {
    id = 'a1',
    name = 'samantha'
}

print(user['id'])
print(user.name)

for k, v in pairs(user) do
    print(k, v)
end
